import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	query: vi.fn(),
	resolveSelectedMeetingId: vi.fn(),
	buildSinceLastMeetingDetailPageData: vi.fn()
}));

vi.mock('$lib/server/convex', () => ({
	api: {
		sinceLastMeeting: {
			getSinceLastMeeting: 'getSinceLastMeeting'
		},
		allActivity: {
			getAllActivityDetail: 'getAllActivityDetail'
		}
	},
	createServerConvexClient: () => ({
		query: mocks.query
	})
}));

vi.mock('$lib/server/meetings', () => ({
	resolveSelectedMeetingId: mocks.resolveSelectedMeetingId
}));

vi.mock('$lib/dashboard/page-models/sinceLastMeeting', () => ({
	buildSinceLastMeetingDetailPageData: mocks.buildSinceLastMeetingDetailPageData
}));

import { load } from './+page.server';

const meetingId = 'meeting-doc-1';
const dealId = 'deal-doc-1';

describe('since-last-meeting detail load', () => {
	beforeEach(() => {
		mocks.query.mockReset();
		mocks.resolveSelectedMeetingId.mockReset();
		mocks.buildSinceLastMeetingDetailPageData.mockReset();
		mocks.resolveSelectedMeetingId.mockReturnValue(meetingId);
	});

	it('returns 404 when the deal is not part of the selected meeting detail set', async () => {
		mocks.query.mockImplementation(async (queryName: string) => {
			if (queryName === 'getSinceLastMeeting') {
				return {
					deals: [
						{
							id: 'other-deal',
							detail: { dealId: 'other-deal' }
						}
					]
				};
			}

			throw new Error(`Unexpected query: ${queryName}`);
		});

		await expect(
			load({
				parent: async () => ({
					route: {
						kind: 'since-last-meeting-detail',
						dealId,
						meetingId
					},
					dashboardShell: {
						people: [],
						meetings: [],
						defaultMeetingId: meetingId
					}
				})
			} as never)
		).rejects.toMatchObject({
			status: 404
		});

		expect(mocks.query).toHaveBeenCalledTimes(1);
		expect(mocks.buildSinceLastMeetingDetailPageData).not.toHaveBeenCalled();
	});

	it('returns 404 when the meeting includes the deal but it has no since-last-meeting detail link', async () => {
		mocks.query.mockImplementation(async (queryName: string) => {
			if (queryName === 'getSinceLastMeeting') {
				return {
					deals: [
						{
							id: dealId,
							detail: null
						}
					]
				};
			}

			throw new Error(`Unexpected query: ${queryName}`);
		});

		await expect(
			load({
				parent: async () => ({
					route: {
						kind: 'since-last-meeting-detail',
						dealId,
						meetingId
					},
					dashboardShell: {
						people: [],
						meetings: [],
						defaultMeetingId: meetingId
					}
				})
			} as never)
		).rejects.toMatchObject({
			status: 404
		});

		expect(mocks.query).toHaveBeenCalledTimes(1);
		expect(mocks.buildSinceLastMeetingDetailPageData).not.toHaveBeenCalled();
	});

	it('builds the page when the deal belongs to the selected meeting and has detail context', async () => {
		const detailReadModel = { title: 'Acme Expansion' };
		const pageData = { hero: { title: 'Acme Expansion' } };

		mocks.query.mockImplementation(async (queryName: string) => {
			if (queryName === 'getSinceLastMeeting') {
				return {
					deals: [
						{
							id: dealId,
							detail: { dealId }
						}
					]
				};
			}

			if (queryName === 'getAllActivityDetail') {
				return detailReadModel;
			}

			throw new Error(`Unexpected query: ${queryName}`);
		});
		mocks.buildSinceLastMeetingDetailPageData.mockReturnValue(pageData);

		await expect(
			load({
				parent: async () => ({
					route: {
						kind: 'since-last-meeting-detail',
						dealId,
						meetingId
					},
					dashboardShell: {
						people: [],
						meetings: [],
						defaultMeetingId: meetingId
					}
				})
			} as never)
		).resolves.toBe(pageData);

		expect(mocks.query).toHaveBeenNthCalledWith(1, 'getSinceLastMeeting', {
			meetingId
		});
		expect(mocks.query).toHaveBeenNthCalledWith(2, 'getAllActivityDetail', {
			detailId: dealId,
			view: 'deals'
		});
		expect(mocks.buildSinceLastMeetingDetailPageData).toHaveBeenCalledWith({
			route: {
				kind: 'since-last-meeting-detail',
				dealId,
				meetingId
			},
			readModel: detailReadModel,
			dashboardShell: {
				people: [],
				meetings: [],
				defaultMeetingId: meetingId
			}
		});
	});
});
