import { describe, expect, it } from 'vitest';
import type {
	AllActivityDetailReadModel,
	DashboardShellReadModel,
	SinceLastMeetingReadModel
} from '$lib/dashboard/read-models';
import type { BrokerId, DealId, MeetingId } from '$lib/types/ids';
import {
	buildSinceLastMeetingDetailPageData,
	buildSinceLastMeetingPageData
} from './sinceLastMeeting';

const dealId = 'deal-doc-1' as DealId;
const otherDealId = 'deal-doc-2' as DealId;
const meetingId = 'meeting-doc-1' as MeetingId;
const brokerId = 'broker-doc-1' as BrokerId;

const sinceLastMeetingReadModel: SinceLastMeetingReadModel = {
	referenceMeetingDateIso: '2026-03-20',
	timelineItems: [
		{
			kind: 'headline',
			id: 'activity-1',
			occurredOnIso: '2026-03-21',
			title: 'Fresh update',
			body: 'Met with the customer.',
			marker: { kind: 'dot' }
		}
	],
	deals: [
		{
			id: dealId,
			detail: { dealId },
			deal: 'Acme Expansion',
			probability: 75,
			activityLevel: 'high',
			stage: 'Proposal'
		},
		{
			id: otherDealId,
			detail: null,
			deal: 'Beacon Renewal',
			probability: 40,
			activityLevel: 'low',
			stage: 'Discovery'
		}
	],
	update: {
		sectionId: 'update',
		uploadLabel: 'Upload files'
	}
};

const detailReadModel: AllActivityDetailReadModel = {
	title: 'Acme Expansion',
	hero: {
		title: 'Acme Expansion',
		description: 'Proposal stage',
		dealNumber: 12
	},
	activityItems: sinceLastMeetingReadModel.timelineItems,
	orgChartNodes: [
		{
			id: 'contact-1',
			name: 'Alex Morgan',
			role: 'CFO',
			lastContactedByBrokerId: brokerId,
			lastContactedOnIso: '2026-03-21'
		}
	],
	update: {
		sectionId: 'update',
		uploadLabel: 'Upload files'
	},
	rightRail: {
		sections: [
			{
				id: 'overview',
				kind: 'rows',
				rows: [
					{
						id: 'deal-number',
						label: 'Deal number',
						kind: 'deal-number',
						dealNumber: 12
					}
				]
			}
		]
	}
};

const dashboardShell: DashboardShellReadModel = {
	people: [
		{
			id: brokerId,
			name: 'Julien Newman',
			avatar: '/avatars/julien.png'
		}
	],
	meetings: [
		{
			id: meetingId,
			dateIso: '2026-03-20'
		}
	],
	defaultMeetingId: meetingId
};

describe('buildSinceLastMeetingPageData', () => {
	it('maps deal detail refs into since-last-meeting navigation routes', () => {
		const result = buildSinceLastMeetingPageData({
			route: {
				kind: 'since-last-meeting',
				meetingId
			},
			readModel: sinceLastMeetingReadModel
		});

		expect(result.deals[0]?.navigation).toEqual({
			kind: 'internal',
			route: {
				kind: 'since-last-meeting-detail',
				dealId,
				meetingId
			}
		});
		expect(result.deals[1]?.navigation).toEqual({
			kind: 'none'
		});
	});
});

describe('buildSinceLastMeetingDetailPageData', () => {
	it('reuses shared deal detail content while pointing the header back to since-last-meeting', () => {
		const result = buildSinceLastMeetingDetailPageData({
			route: {
				kind: 'since-last-meeting-detail',
				dealId,
				meetingId
			},
			readModel: detailReadModel,
			dashboardShell
		});

		expect(result.header.leading).toEqual({
			kind: 'control-title',
			title: 'Acme Expansion',
			control: {
				kind: 'back-link',
				route: {
					kind: 'since-last-meeting',
					meetingId
				},
				label: 'Since last meeting'
			}
		});
		expect(result.hero).toEqual(detailReadModel.hero);
		expect(result.activityItems).toEqual(detailReadModel.activityItems);
		expect(result.orgChartRoot).toMatchObject({
			id: 'contact-1',
			name: 'Alex Morgan',
			lastContacted: {
				by: 'Julien Newman',
				on: 'March 21, 2026'
			}
		});
	});
});
