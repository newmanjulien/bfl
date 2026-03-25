import { activeMeetingDateIso } from '$lib/dashboard/meeting-date';
import { mockDb } from '$lib/mock-db';
import { describe, expect, it } from 'vitest';
import { allActivityTableRows, getAllActivityDetailViewById } from './all-activity/projection';
import { forecastQuadrantChart } from './forecast/projection';
import { getMyDealsDetailViewById, myDealsTableRows } from './my-deals/projection';
import {
	getOpportunityDetailViewById,
	opportunitiesTiles,
	opportunityRiskTiles
} from './opportunities/projection';
import {
	sinceLastMeetingDeals,
	sinceLastMeetingReferenceIso,
	sinceLastMeetingTimelineItems
} from './since-last-meeting/projection';

describe('dashboard data adapters', () => {
	it('renders unassigned owners cleanly in deal list projections', () => {
		expect(allActivityTableRows.find((row) => row.id === 'deal-fedex')?.owner).toBeNull();
		expect(myDealsTableRows.find((row) => row.id === 'deal-fedex')?.owner).toBeNull();
	});

	it('uses the canonical deal number for deal detail views', () => {
		const allActivityDetail = getAllActivityDetailViewById('deal-3m');
		const myDealsDetail = getMyDealsDetailViewById('deal-3m');

		expect(allActivityDetail?.hero.dealNumber).toBe(74);
		expect(allActivityDetail?.rightRail.metadata.dealNumber).toBe(74);
		expect(myDealsDetail?.hero.dealNumber).toBe(74);
		expect(myDealsDetail?.rightRail.metadata.dealNumber).toBe(74);
		expect('metaId' in (allActivityDetail?.hero ?? {})).toBe(false);
	});

	it('uses the parent deal number for opportunity and risk views', () => {
		const opportunityTile = opportunitiesTiles.find((tile) => tile.id === 'insight-118');
		const riskTile = opportunityRiskTiles.find((tile) => tile.id === 'insight-119');
		const riskDetail = getOpportunityDetailViewById('insight-119');

		expect(opportunityTile?.dealNumber).toBe(118);
		expect(riskTile?.dealNumber).toBe(74);
		expect(riskDetail?.hero.dealNumber).toBe(74);
		expect(riskDetail?.rightRail.metadata.dealNumber).toBe(74);
	});

	it('uses a limited summary rail instead of fabricating canonical deal detail data', () => {
		const opportunityDetail = getOpportunityDetailViewById('insight-118');

		expect(opportunityDetail?.hero.dealNumber).toBe(118);
		expect(opportunityDetail?.rightRail.kind).toBe('metadata');

		if (!opportunityDetail || opportunityDetail.rightRail.kind !== 'metadata') {
			throw new Error('Expected a metadata right rail for the Honeywell opportunity detail.');
		}

		expect(opportunityDetail.rightRail.metadata.dealNumber).toBe(118);
		expect(opportunityDetail.rightRail.limitation).toBe('missing-detail-context');
		expect('timing' in opportunityDetail.rightRail).toBe(false);
		expect('activityTrend' in opportunityDetail.rightRail).toBe(false);
	});

	it('derives since-last-meeting and forecast screens from canonical deal data', () => {
		expect(sinceLastMeetingReferenceIso).toBe(activeMeetingDateIso);
		expect(mockDb.meetings.listDateIsos()).toContain(activeMeetingDateIso);
		expect(sinceLastMeetingTimelineItems.map((item) => item.id)).toEqual([
			'activity-tyson-second-meeting',
			'activity-whirlpool-cfo',
			'activity-3m-legal-signoff'
		]);
		expect(sinceLastMeetingDeals.map((deal) => deal.id)).toEqual([
			'deal-tyson',
			'deal-whirlpool',
			'deal-3m'
		]);

		const point = forecastQuadrantChart.points.find((candidate) => candidate.id === 'deal-3m');

		expect(point?.label).toBe('3M');
		expect(point?.x).toBe(25);
		expect(point?.y).toBe(74);
	});
});
