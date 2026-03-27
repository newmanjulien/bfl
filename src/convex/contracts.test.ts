import { convexTest } from 'convex-test';
import { describe, expect, it } from 'vitest';
import type { OrgChartNodeRecord } from '../lib/domain/org-chart';
import { api } from './_generated/api';
import schema from './schema';
import { convexTestModules } from './test.setup';

function createConvex() {
	return convexTest(schema, convexTestModules);
}

async function seedDashboardRecords(t: ReturnType<typeof createConvex>) {
	return t.run(async (ctx) => {
		const ownerBrokerId = await ctx.db.insert('brokers', {
			legacyId: 'broker-owner',
			name: 'Julien Newman',
			avatar: '/avatars/julien.png'
		});
		const collaboratorBrokerId = await ctx.db.insert('brokers', {
			legacyId: 'broker-collab',
			name: 'Mina Chen',
			avatar: '/avatars/mina.png'
		});

		await ctx.db.insert('meetingSchedule', {
			key: 'default',
			meetingDateIsos: ['2026-03-20', '2026-03-27'],
			activeMeetingDateIso: '2026-03-20'
		});

		const dealOrgChartNodes: OrgChartNodeRecord[] = [
			{
				id: 'root',
				name: 'Alex Morgan',
				role: 'CFO',
				lastContactedByBrokerId: ownerBrokerId,
				lastContactedOnIso: '2026-03-21'
			},
			{
				id: 'vp-finance',
				parentId: 'root',
				name: 'Taylor Smith',
				role: 'VP Finance',
				lastContactedByBrokerId: collaboratorBrokerId,
				lastContactedOnIso: '2026-03-22'
			},
			{
				id: 'controller',
				parentId: 'vp-finance',
				name: 'Jordan Lee',
				role: 'Controller',
				lastContactedByBrokerId: ownerBrokerId,
				lastContactedOnIso: '2026-03-23'
			},
			{
				id: 'cio',
				parentId: 'root',
				name: 'Morgan Ellis',
				role: 'CIO',
				lastContactedByBrokerId: ownerBrokerId,
				lastContactedOnIso: '2026-03-24'
			}
		];
		const insightOrgChartNodes: OrgChartNodeRecord[] = [
			{
				id: 'root',
				name: 'Alex Morgan',
				role: 'CFO',
				lastContactedByBrokerId: ownerBrokerId,
				lastContactedOnIso: '2026-03-21'
			},
			{
				id: 'security',
				parentId: 'root',
				name: 'Sam Rivera',
				role: 'Head of Security',
				lastContactedByBrokerId: collaboratorBrokerId,
				lastContactedOnIso: '2026-03-22'
			},
			{
				id: 'procurement',
				parentId: 'root',
				name: 'Parker Lee',
				role: 'Procurement Lead',
				lastContactedByBrokerId: ownerBrokerId,
				lastContactedOnIso: '2026-03-23'
			}
		];

		const dealId = await ctx.db.insert('deals', {
			dealNumber: 42,
			accountName: 'Acme Foods',
			industry: 'Hospitality',
			dealName: 'Acme Expansion',
			isReservedInEpic: false,
			probability: 70,
			stage: 'Discovery',
			isLikelyOutOfDate: false,
			activityLevel: 'high',
			lastActivityAtIso: '2026-03-24T10:00:00Z',
			ownerBrokerId,
			collaboratorBrokerIds: [collaboratorBrokerId],
			context: {
				summary: 'Needs support on procurement timing.',
				claimedAtIso: '2026-03-10T09:00:00Z',
				orgChartNodes: dealOrgChartNodes,
				helpfulContacts: [
					{
						id: 'contact-1',
						name: 'Taylor Smith',
						title: 'VP Finance',
						company: 'Acme Foods',
						linkedInUrl: 'https://linkedin.com/in/taylor-smith'
					}
				]
			},
			dashboardFlags: {
				needsSupport: true,
				duplicatedWork: false
			}
		});

		await ctx.db.insert('news', {
			dealId,
			title: 'Acme opens a new distribution hub',
			source: 'news',
			publishedOnIso: '2026-03-25'
		});
		await ctx.db.insert('news', {
			dealId,
			title: 'Older weekly note',
			source: 'linkedin',
			publishedOnIso: '2026-03-12'
		});

		await ctx.db.insert('activities', {
			kind: 'headline',
			dealId,
			stream: 'deal-detail',
			occurredOnIso: '2026-03-24',
			body: 'Discussed procurement blockers.',
			marker: { kind: 'dot' },
			title: 'Weekly follow-up'
		});
		await ctx.db.insert('activities', {
			kind: 'headline',
			dealId,
			stream: 'meeting-update',
			occurredOnIso: '2026-03-18',
			body: 'This should be filtered out by the meeting date.',
			marker: { kind: 'dot' },
			title: 'Old update'
		});
		await ctx.db.insert('activities', {
			kind: 'headline',
			dealId,
			stream: 'meeting-update',
			occurredOnIso: '2026-03-22',
			body: 'This should appear in since-last-meeting.',
			marker: { kind: 'dot' },
			title: 'Fresh update'
		});

		const insightId = await ctx.db.insert('insights', {
			dealId,
			kind: 'opportunity',
			title: 'Expand into adjacent services',
			ownerBrokerId,
			collaboratorBrokerIds: [collaboratorBrokerId],
			timeline: [
				{
					kind: 'headline',
					id: 'timeline-1',
					dealId,
					stream: 'deal-detail',
					occurredOnIso: '2026-03-23',
					body: 'Customer is receptive to a broader package.',
					marker: { kind: 'dot' },
					title: 'Procurement note'
				}
			],
			orgChartNodes: insightOrgChartNodes
		});

		return {
			ownerBrokerId,
			collaboratorBrokerId,
			dealId,
			insightId,
			dealOrgChartNodes,
			insightOrgChartNodes
		};
	});
}

function getIndustryRow(result: {
	rightRail: {
		sections: {
			kind: 'rows' | 'helpful-contacts';
			rows?: {
				kind: string;
				dealId?: string;
			}[];
		}[];
	};
}) {
	for (const section of result.rightRail.sections) {
		if (section.kind !== 'rows') {
			continue;
		}

		for (const row of section.rows ?? []) {
			if (row.kind === 'industry') {
				return row;
			}
		}
	}

	return null;
}

describe('Convex feature contracts', () => {
	it('returns my deals detail for a valid route param and preserves the canonical deal id', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		const result = await t.query(api.myDeals.getMyDealsDetail, {
			detailId: seed.dealId,
			brokerId: seed.collaboratorBrokerId,
			view: 'news'
		});

		expect(result).not.toBeNull();
		expect(getIndustryRow(result!)).toMatchObject({ dealId: seed.dealId });
	});

	it('returns dashboard read models without UI navigation contracts', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		const myDealsList = await t.query(api.myDeals.getMyDealsList, {
			brokerId: seed.collaboratorBrokerId,
			view: 'news'
		});
		const myDealsDetail = await t.query(api.myDeals.getMyDealsDetail, {
			detailId: seed.dealId,
			brokerId: seed.collaboratorBrokerId,
			view: 'news'
		});
		const allActivityList = await t.query(api.allActivity.getAllActivityList, {
			view: 'deals'
		});
		const allActivityDetail = await t.query(api.allActivity.getAllActivityDetail, {
			detailId: seed.dealId,
			view: 'deals'
		});
		const opportunitiesList = await t.query(api.opportunities.getOpportunitiesList);
		const opportunityDetail = await t.query(api.opportunities.getOpportunityDetail, {
			detailId: seed.insightId
		});

		expect(myDealsList).not.toHaveProperty('header');
		expect(myDealsList.rows).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: seed.dealId,
					detail: {
						dealId: seed.dealId,
						defaultTab: 'news'
					}
				})
			])
		);
		expect(myDealsList.newsItems.every((item) => !('detail' in item))).toBe(true);
		expect(myDealsList.watchlistItems).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					kind: 'activity',
					detail: {
						dealId: seed.dealId,
						defaultTab: 'activity'
					}
				})
			])
		);
		expect(myDealsDetail).not.toHaveProperty('header');
		expect(myDealsDetail?.title).toBe('Acme Expansion');

		expect(allActivityList).not.toHaveProperty('header');
		expect(allActivityList.rows).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: seed.dealId,
					detail: {
						dealId: seed.dealId
					}
				})
			])
		);
		expect(allActivityDetail).not.toHaveProperty('header');
		expect(allActivityDetail?.title).toBe('Acme Expansion');

		expect(opportunitiesList.opportunityTiles).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: seed.insightId,
					detail: {
						insightId: seed.insightId
					}
				})
			])
		);
		expect(opportunitiesList.update).toEqual(
			expect.objectContaining({
				sectionId: 'update',
				uploadLabel: 'Upload files'
			})
		);
		expect(opportunityDetail).not.toHaveProperty('header');
		expect(opportunityDetail?.title).toBe('Expand into adjacent services');
	});

	it('returns null for an invalid my deals route param', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		const result = await t.query(api.myDeals.getMyDealsDetail, {
			detailId: 'not-a-deal-id',
			brokerId: seed.collaboratorBrokerId,
			view: 'news'
		});

		expect(result).toBeNull();
	});

	it('returns null for a deleted my deals record', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		await t.run(async (ctx) => {
			await ctx.db.delete(seed.dealId);
		});

		const result = await t.query(api.myDeals.getMyDealsDetail, {
			detailId: seed.dealId,
			brokerId: seed.collaboratorBrokerId,
			view: 'news'
		});

		expect(result).toBeNull();
	});

	it('returns all activity detail for a valid route param and preserves the canonical deal id', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		const result = await t.query(api.allActivity.getAllActivityDetail, {
			detailId: seed.dealId,
			view: 'deals'
		});

		expect(result).not.toBeNull();
		expect(getIndustryRow(result!)).toMatchObject({ dealId: seed.dealId });
		expect(result!.orgChartNodes).toEqual(seed.dealOrgChartNodes);
	});

	it('normalizes legacy deal org charts stored as nested roots', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		const legacyDealId = await t.run(async (ctx) =>
			ctx.db.insert(
				'deals',
				{
					dealNumber: 404,
					accountName: 'Legacy Co',
					industry: 'Industrials',
					dealName: 'Legacy Org Chart',
					isReservedInEpic: false,
					probability: 55,
					stage: 'Proposal',
					isLikelyOutOfDate: false,
					activityLevel: 'medium',
					lastActivityAtIso: '2026-03-24T10:00:00Z',
					ownerBrokerId: seed.ownerBrokerId,
					collaboratorBrokerIds: [seed.collaboratorBrokerId],
					context: {
						summary: 'Stored before org chart flattening.',
						claimedAtIso: '2026-03-10T09:00:00Z',
						orgChartRoot: {
							id: 'legacy-root',
							name: 'Alex Morgan',
							role: 'CFO',
							lastContactedByBrokerId: seed.ownerBrokerId,
							lastContactedOnIso: '2026-03-21',
							directReports: [
								{
									id: 'legacy-child',
									name: 'Taylor Smith',
									role: 'VP Finance',
									lastContactedByBrokerId: seed.collaboratorBrokerId,
									lastContactedOnIso: '2026-03-22'
								}
							]
						}
					},
					dashboardFlags: {
						needsSupport: false,
						duplicatedWork: false
					}
				} as never
			)
		);

		const result = await t.query(api.allActivity.getAllActivityDetail, {
			detailId: legacyDealId,
			view: 'deals'
		});

		expect(result).not.toBeNull();
		expect(result!.orgChartNodes).toEqual([
			{
				id: 'legacy-root',
				name: 'Alex Morgan',
				role: 'CFO',
				lastContactedByBrokerId: seed.ownerBrokerId,
				lastContactedOnIso: '2026-03-21'
			},
			{
				id: 'legacy-child',
				parentId: 'legacy-root',
				name: 'Taylor Smith',
				role: 'VP Finance',
				lastContactedByBrokerId: seed.collaboratorBrokerId,
				lastContactedOnIso: '2026-03-22'
			}
		]);
	});

	it('returns null for an invalid all activity route param', async () => {
		const t = createConvex();
		await seedDashboardRecords(t);

		const result = await t.query(api.allActivity.getAllActivityDetail, {
			detailId: 'bad-deal-id',
			view: 'deals'
		});

		expect(result).toBeNull();
	});

	it('returns null for a deleted all activity record', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		await t.run(async (ctx) => {
			await ctx.db.delete(seed.dealId);
		});

		const result = await t.query(api.allActivity.getAllActivityDetail, {
			detailId: seed.dealId,
			view: 'deals'
		});

		expect(result).toBeNull();
	});

	it('returns opportunity detail for a valid route param and preserves the canonical deal id', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		const result = await t.query(api.opportunities.getOpportunityDetail, {
			detailId: seed.insightId
		});

		expect(result).not.toBeNull();
		expect(getIndustryRow(result!)).toMatchObject({ dealId: seed.dealId });
		expect(result!.orgChartNodes).toEqual(seed.insightOrgChartNodes);
	});

	it('normalizes legacy insight org charts stored as nested roots', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		const legacyInsightId = await t.run(async (ctx) =>
			ctx.db.insert(
				'insights',
				{
					dealId: seed.dealId,
					kind: 'risk',
					title: 'Legacy Risk Insight',
					ownerBrokerId: seed.ownerBrokerId,
					collaboratorBrokerIds: [seed.collaboratorBrokerId],
					timeline: [
						{
							kind: 'headline',
							id: 'legacy-risk-1',
							dealId: seed.dealId,
							stream: 'deal-detail',
							occurredOnIso: '2026-03-23',
							body: 'Legacy insight still needs flattening.',
							marker: { kind: 'dot' },
							title: 'Legacy note'
						}
					],
					orgChartRoot: {
						id: 'legacy-insight-root',
						name: 'Jordan Lee',
						role: 'Chief Procurement Officer',
						lastContactedByBrokerId: seed.ownerBrokerId,
						lastContactedOnIso: '2026-03-23',
						directReports: [
							{
								id: 'legacy-insight-child',
								name: 'Sam Rivera',
								role: 'Security Lead',
								lastContactedByBrokerId: seed.collaboratorBrokerId,
								lastContactedOnIso: '2026-03-24'
							}
						]
					}
				} as never
			)
		);

		const result = await t.query(api.opportunities.getOpportunityDetail, {
			detailId: legacyInsightId
		});

		expect(result).not.toBeNull();
		expect(result!.orgChartNodes).toEqual([
			{
				id: 'legacy-insight-root',
				name: 'Jordan Lee',
				role: 'Chief Procurement Officer',
				lastContactedByBrokerId: seed.ownerBrokerId,
				lastContactedOnIso: '2026-03-23'
			},
			{
				id: 'legacy-insight-child',
				parentId: 'legacy-insight-root',
				name: 'Sam Rivera',
				role: 'Security Lead',
				lastContactedByBrokerId: seed.collaboratorBrokerId,
				lastContactedOnIso: '2026-03-24'
			}
		]);
	});

	it('returns null for an invalid opportunity route param', async () => {
		const t = createConvex();
		await seedDashboardRecords(t);

		const result = await t.query(api.opportunities.getOpportunityDetail, {
			detailId: 'bad-insight-id'
		});

		expect(result).toBeNull();
	});

	it('returns null for a deleted opportunity record', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		await t.run(async (ctx) => {
			await ctx.db.delete(seed.insightId);
		});

		const result = await t.query(api.opportunities.getOpportunityDetail, {
			detailId: seed.insightId
		});

		expect(result).toBeNull();
	});

	it('rejects invalid flat org chart records at write time', async () => {
		const t = createConvex();

		await expect(
			t.run(async (ctx) => {
				const brokerId = await ctx.db.insert('brokers', {
					legacyId: 'broker-invalid-shape',
					name: 'Invalid Shape',
					avatar: '/avatars/invalid.png'
				});

				await ctx.db.insert(
					'deals',
					{
						dealNumber: 777,
						accountName: 'Broken Co',
						industry: 'Industrials',
						dealName: 'Broken Shape',
						isReservedInEpic: false,
						probability: 20,
						stage: 'Discovery',
						isLikelyOutOfDate: false,
						activityLevel: 'low',
						collaboratorBrokerIds: [],
						context: {
							summary: 'Invalid org chart shape',
							claimedAtIso: '2026-03-10T09:00:00Z',
							orgChartNodes: [
								{
									id: 'broken-node',
									name: 'Broken Node',
									lastContactedByBrokerId: brokerId,
									lastContactedOnIso: '2026-03-21'
								}
							]
						},
						dashboardFlags: {
							needsSupport: false,
							duplicatedWork: false
						}
					} as never
				);
			})
			).rejects.toThrow();
	});

	it('rejects malformed stored meeting dates at the Convex read boundary', async () => {
		const t = createConvex();

		await t.run(async (ctx) => {
			await ctx.db.insert('meetingSchedule', {
				key: 'default',
				meetingDateIsos: ['2026-3-20'],
				activeMeetingDateIso: '2026-03-20'
			});
		});

		await expect(t.query(api.shell.getDashboardShell)).rejects.toThrow(
			'Invalid ISO date at "meetingSchedule.meetingDateIsos[0]": "2026-3-20".'
		);
	});

	it('filters since-last-meeting activity to the active meeting date', async () => {
		const t = createConvex();
		await seedDashboardRecords(t);

		const result = await t.query(api.sinceLastMeeting.getSinceLastMeeting);

		expect(result.referenceMeetingDateIso).toBe('2026-03-20');
		expect(result.timelineItems).toHaveLength(1);
		expect(result.timelineItems[0]).toMatchObject({
			kind: 'headline',
			title: 'Fresh update'
		});
		expect(result.deals).toHaveLength(1);
	});

	it('keeps my deals news scoped to the current reference week', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		const result = await t.query(api.myDeals.getMyDealsList, {
			brokerId: seed.collaboratorBrokerId,
			view: 'news'
		});

		expect(result.newsItems).toHaveLength(1);
		expect(result.newsItems[0]).toMatchObject({
			title: 'Acme opens a new distribution hub',
			dateIso: '2026-03-25'
		});
	});

	it('updates industry through the canonical deal id contract', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		await expect(
			t.action(api.mutations.updateDealIndustry, {
				dealId: seed.dealId,
				industry: 'Food & beverage'
			})
		).resolves.toBe('updated');

		const updatedDeal = await t.run(async (ctx) => ctx.db.get(seed.dealId));

		expect(updatedDeal?.industry).toBe('Food & beverage');
	});

	it('returns not-found when industry update receives a malformed deal id', async () => {
		const t = createConvex();
		await seedDashboardRecords(t);

		await expect(
			t.action(api.mutations.updateDealIndustry, {
				dealId: 'not-a-deal-id',
				industry: 'Food & beverage'
			})
		).resolves.toBe('not-found');
	});
});
