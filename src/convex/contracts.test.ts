import { convexTest } from 'convex-test';
import { describe, expect, it } from 'vitest';
import type { OrgChartNodeRecord as InternalOrgChartNodeRecord } from '../lib/domain/org-chart';
import type { BrokerKey, DealKey, InsightKey, MeetingKey } from '../lib/types/keys';
import { api } from './_generated/api';
import schema from './schema';
import { convexTestModules } from './test.setup';

function createConvex() {
	return convexTest(schema, convexTestModules);
}

function toExpectedDashboardOrgChartNodes(
	nodes: readonly InternalOrgChartNodeRecord[],
	params: {
		ownerBrokerId: string;
		ownerBrokerKey: string;
		collaboratorBrokerKey: string;
	}
) {
	return nodes.map((node) => ({
		id: node.id,
		name: node.name,
		role: node.role,
		parentId: node.parentId,
		lastContactedByBrokerKey:
			node.lastContactedByBrokerId === params.ownerBrokerId
				? params.ownerBrokerKey
				: params.collaboratorBrokerKey,
		lastContactedOnIso: node.lastContactedOnIso
	}));
}

async function seedDashboardRecords(t: ReturnType<typeof createConvex>) {
	return t.run(async (ctx) => {
		const ownerBrokerKey = 'julien' as BrokerKey;
		const collaboratorBrokerKey = 'mina' as BrokerKey;
		const dealKey = 'acme-expansion' as DealKey;
		const insightKey = 'expand-adjacent-services' as InsightKey;
		const march20MeetingKey = '2026-03-20' as MeetingKey;
		const march27MeetingKey = '2026-03-27' as MeetingKey;

		const ownerBrokerId = await ctx.db.insert('brokers', {
			key: ownerBrokerKey,
			name: 'Julien Newman',
			avatar: '/avatars/julien.png'
		});
		const collaboratorBrokerId = await ctx.db.insert('brokers', {
			key: collaboratorBrokerKey,
			name: 'Mina Chen',
			avatar: '/avatars/mina.png'
		});

		const march20MeetingId = await ctx.db.insert('meetings', {
			key: march20MeetingKey,
			dateIso: '2026-03-20'
		});
		const march27MeetingId = await ctx.db.insert('meetings', {
			key: march27MeetingKey,
			dateIso: '2026-03-27'
		});

		const dealOrgChartNodes: InternalOrgChartNodeRecord[] = [
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
		const insightOrgChartNodes: InternalOrgChartNodeRecord[] = [
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
			key: dealKey,
			dealNumber: 42,
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
			meetingId: march27MeetingId,
			stream: 'meeting-update',
			occurredOnIso: '2026-03-18',
			body: 'This belongs to a different meeting.',
			marker: { kind: 'dot' },
			title: 'Old update'
		});
		await ctx.db.insert('activities', {
			kind: 'headline',
			dealId,
			meetingId: march20MeetingId,
			stream: 'meeting-update',
			occurredOnIso: '2026-03-22',
			body: 'This should appear in since-last-meeting.',
			marker: { kind: 'dot' },
			title: 'Fresh update'
		});

		const insightId = await ctx.db.insert('insights', {
			key: insightKey,
			dealId,
			meetingId: march20MeetingId,
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
			ownerBrokerKey,
			collaboratorBrokerId,
			collaboratorBrokerKey,
			dealId,
			dealKey,
			insightId,
			insightKey,
			march20MeetingId,
			march20MeetingKey,
			march27MeetingId,
			march27MeetingKey,
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
				dealKey?: string;
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
	it('returns my deals detail for a valid route param and preserves the canonical deal key', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		const result = await t.query(api.myDeals.getMyDealsDetail, {
			dealKey: seed.dealKey,
			brokerKey: seed.collaboratorBrokerKey,
			view: 'news'
		});

		expect(result).not.toBeNull();
		expect(getIndustryRow(result!)).toMatchObject({ dealKey: seed.dealKey });
	});

	it('returns dashboard read models without UI navigation contracts', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		const myDealsList = await t.query(api.myDeals.getMyDealsList, {
			brokerKey: seed.collaboratorBrokerKey,
			view: 'news'
		});
		const myDealsDetail = await t.query(api.myDeals.getMyDealsDetail, {
			dealKey: seed.dealKey,
			brokerKey: seed.collaboratorBrokerKey,
			view: 'news'
		});
		const allActivityList = await t.query(api.allActivity.getAllActivityList, {
			view: 'deals'
		});
		const allActivityDetail = await t.query(api.allActivity.getAllActivityDetail, {
			dealKey: seed.dealKey,
			view: 'deals'
		});
		const opportunitiesList = await t.query(api.opportunities.getOpportunitiesList, {
			meetingKey: seed.march20MeetingKey
		});
		const opportunityDetail = await t.query(api.opportunities.getOpportunityDetail, {
			insightKey: seed.insightKey,
			meetingKey: seed.march20MeetingKey
		});

		expect(myDealsList).not.toHaveProperty('header');
		expect(myDealsList.rows).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					key: seed.dealKey,
					detail: {
						dealKey: seed.dealKey,
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
						dealKey: seed.dealKey,
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
					key: seed.dealKey,
					detail: {
						dealKey: seed.dealKey
					}
				})
			])
		);
		expect(allActivityDetail).not.toHaveProperty('header');
		expect(allActivityDetail?.title).toBe('Acme Expansion');

		expect(opportunitiesList.opportunityTiles).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					key: seed.insightKey,
					detail: {
						insightKey: seed.insightKey
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
			dealKey: 'not-a-deal-key',
			brokerKey: seed.collaboratorBrokerKey,
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
			dealKey: seed.dealKey,
			brokerKey: seed.collaboratorBrokerKey,
			view: 'news'
		});

		expect(result).toBeNull();
	});

	it('returns all activity detail for a valid route param and preserves the canonical deal key', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		const result = await t.query(api.allActivity.getAllActivityDetail, {
			dealKey: seed.dealKey,
			view: 'deals'
		});

		expect(result).not.toBeNull();
		expect(getIndustryRow(result!)).toMatchObject({ dealKey: seed.dealKey });
		expect(result!.orgChartNodes).toEqual(
			toExpectedDashboardOrgChartNodes(seed.dealOrgChartNodes, seed)
		);
	});

	it('normalizes legacy deal org charts stored as nested roots', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);
		const legacyDealKey = 'legacy-org-chart' as DealKey;

		await t.run(async (ctx) => {
			await ctx.db.insert(
				'deals',
				{
					key: legacyDealKey,
					dealNumber: 404,
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
			);
		});

		const result = await t.query(api.allActivity.getAllActivityDetail, {
			dealKey: legacyDealKey,
			view: 'deals'
		});

		expect(result).not.toBeNull();
		expect(result!.orgChartNodes).toEqual([
			{
				id: 'legacy-root',
				name: 'Alex Morgan',
				role: 'CFO',
				parentId: undefined,
				lastContactedByBrokerKey: seed.ownerBrokerKey,
				lastContactedOnIso: '2026-03-21'
			},
			{
				id: 'legacy-child',
				parentId: 'legacy-root',
				name: 'Taylor Smith',
				role: 'VP Finance',
				lastContactedByBrokerKey: seed.collaboratorBrokerKey,
				lastContactedOnIso: '2026-03-22'
			}
		]);
	});

	it('returns null for an invalid all activity route param', async () => {
		const t = createConvex();
		await seedDashboardRecords(t);

		const result = await t.query(api.allActivity.getAllActivityDetail, {
			dealKey: 'bad-deal-key',
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
			dealKey: seed.dealKey,
			view: 'deals'
		});

		expect(result).toBeNull();
	});

	it('returns opportunity detail for a valid route param and preserves the canonical deal key', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		const result = await t.query(api.opportunities.getOpportunityDetail, {
			insightKey: seed.insightKey,
			meetingKey: seed.march20MeetingKey
		});

		expect(result).not.toBeNull();
		expect(getIndustryRow(result!)).toMatchObject({ dealKey: seed.dealKey });
		expect(result!.orgChartNodes).toEqual(
			toExpectedDashboardOrgChartNodes(seed.insightOrgChartNodes, seed)
		);
	});

	it('normalizes legacy insight org charts stored as nested roots', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);
		const legacyInsightKey = 'legacy-risk-insight' as InsightKey;

		await t.run(async (ctx) => {
			await ctx.db.insert(
				'insights',
				{
					key: legacyInsightKey,
					dealId: seed.dealId,
					meetingId: seed.march20MeetingId,
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
			);
		});

		const result = await t.query(api.opportunities.getOpportunityDetail, {
			insightKey: legacyInsightKey,
			meetingKey: seed.march20MeetingKey
		});

		expect(result).not.toBeNull();
		expect(result!.orgChartNodes).toEqual([
			{
				id: 'legacy-insight-root',
				name: 'Jordan Lee',
				role: 'Chief Procurement Officer',
				parentId: undefined,
				lastContactedByBrokerKey: seed.ownerBrokerKey,
				lastContactedOnIso: '2026-03-23'
			},
			{
				id: 'legacy-insight-child',
				parentId: 'legacy-insight-root',
				name: 'Sam Rivera',
				role: 'Security Lead',
				lastContactedByBrokerKey: seed.collaboratorBrokerKey,
				lastContactedOnIso: '2026-03-24'
			}
		]);
	});

	it('returns null for an invalid opportunity route param', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		const result = await t.query(api.opportunities.getOpportunityDetail, {
			insightKey: 'bad-insight-key',
			meetingKey: seed.march20MeetingKey
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
			insightKey: seed.insightKey,
			meetingKey: seed.march20MeetingKey
		});

		expect(result).toBeNull();
	});

	it('rejects invalid flat org chart records at write time', async () => {
		const t = createConvex();

		await expect(
			t.run(async (ctx) => {
				const brokerId = await ctx.db.insert('brokers', {
					key: 'invalid-shape',
					name: 'Invalid Shape',
					avatar: '/avatars/invalid.png'
				});

				await ctx.db.insert(
					'deals',
					{
						key: 'broken-shape',
						dealNumber: 777,
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
			await ctx.db.insert('meetings', {
				key: 'bad-meeting-date',
				dateIso: '2026-3-20'
			});
		});

		await expect(t.query(api.shell.getDashboardShell)).rejects.toThrow(
			'Invalid ISO date at "meetings'
		);
	});

	it('filters since-last-meeting activity to the selected meeting', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		const result = await t.query(api.sinceLastMeeting.getSinceLastMeeting, {
			meetingKey: seed.march20MeetingKey
		});

		expect(result.referenceMeetingDateIso).toBe('2026-03-20');
		expect(result.timelineItems).toHaveLength(1);
		expect(result.timelineItems[0]).toMatchObject({
			kind: 'headline',
			title: 'Fresh update'
		});
		expect(result.deals).toHaveLength(1);
		expect(result.deals[0]).toMatchObject({ key: seed.dealKey });
	});

	it('keeps my deals news scoped to the current reference week', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		const result = await t.query(api.myDeals.getMyDealsList, {
			brokerKey: seed.collaboratorBrokerKey,
			view: 'news'
		});

		expect(result.newsItems).toHaveLength(1);
		expect(result.newsItems[0]).toMatchObject({
			title: 'Acme opens a new distribution hub',
			dateIso: '2026-03-25'
		});
	});

	it('updates industry through the canonical deal key contract', async () => {
		const t = createConvex();
		const seed = await seedDashboardRecords(t);

		await expect(
			t.action(api.mutations.updateDealIndustry, {
				dealKey: seed.dealKey,
				industry: 'Food & beverage'
			})
		).resolves.toBe('updated');

		const updatedDeal = await t.run(async (ctx) => ctx.db.get(seed.dealId));

		expect(updatedDeal?.industry).toBe('Food & beverage');
	});

	it('returns not-found when industry update receives a malformed deal key', async () => {
		const t = createConvex();
		await seedDashboardRecords(t);

		await expect(
			t.action(api.mutations.updateDealIndustry, {
				dealKey: 'not-a-deal-key' as DealKey,
				industry: 'Food & beverage'
			})
		).resolves.toBe('not-found');
	});
});
