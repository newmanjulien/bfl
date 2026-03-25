import { activeMeetingDateIso } from '$lib/dashboard/meeting-date';
import { getDashboardHeader } from '$lib/dashboard/shell/dashboard-header';
import { mockDb } from '$lib/mock-db';
import { describe, expect, it } from 'vitest';
import {
	allActivityTableRows,
	buildAllActivityDetailHref,
	buildAllActivityListHref,
	getAllActivityDetailViewById,
	getAllActivityRowsForView,
	parseAllActivityView
} from './all-activity/projection';
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

	it('uses the route view as the source of truth for all-activity tables', () => {
		expect(parseAllActivityView(undefined)).toBe('deals');
		expect(parseAllActivityView('unexpected-view')).toBe('deals');
		expect(getAllActivityRowsForView('deals')).toEqual(allActivityTableRows);
		expect(getAllActivityRowsForView('need-support').map((row) => row.id)).toEqual([
			'deal-fedex',
			'deal-hilton'
		]);
		expect(getAllActivityRowsForView('duplicated-work').map((row) => row.id)).toEqual(['deal-3m']);
		expect(buildAllActivityListHref('deals')).toBe('/all-activity');
		expect(buildAllActivityListHref('need-support')).toBe('/all-activity?view=need-support');
		expect(buildAllActivityDetailHref('deal-3m', 'deals')).toBe('/all-activity/detail/deal-3m');
		expect(buildAllActivityDetailHref('deal-3m', 'duplicated-work')).toBe(
			'/all-activity/detail/deal-3m?view=duplicated-work'
		);
		expect(getAllActivityRowsForView('duplicated-work')[0]?.navigation).toEqual({
			kind: 'detail',
			href: '/all-activity/detail/deal-3m?view=duplicated-work'
		});
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

describe('dashboard header model', () => {
	it('renders my deals as a plain title header', () => {
		const header = getDashboardHeader('/my-deals');

		expect(header).toEqual({
			leading: {
				kind: 'title',
				title: 'My deals'
			},
			actions: ['share'],
			extra: 'add-deal'
		});
	});

	it('exposes the all-activity title menu without replacing the existing header filters', () => {
		const titleMenu = {
			kind: 'link-menu' as const,
			menuId: 'desktop-all-activity-view',
			ariaLabel: 'Change all activity view',
			sectionLabel: 'Select all activity view',
			activeLabel: 'Need support',
			options: [
				{
					id: 'deals',
					label: 'Deals',
					href: '/all-activity',
					current: false
				},
				{
					id: 'need-support',
					label: 'Need support',
					href: '/all-activity?view=need-support',
					current: true
				}
			]
		};
		const header = getDashboardHeader('/all-activity', { headerTitleMenu: titleMenu });

		expect(header).toEqual({
			leading: {
				kind: 'title-menu',
				title: 'All activity',
				menu: titleMenu
			},
			actions: ['share'],
			extra: 'all-activity-filters'
		});
	});

	it('renders dashboard overview routes as control-title headers', () => {
		expect(getDashboardHeader('/forecast')).toEqual({
			leading: {
				kind: 'control-title',
				title: 'Forecast',
				control: { kind: 'meeting-date' }
			},
			actions: ['share', 'broker-switch']
		});

		expect(getDashboardHeader('/opportunities')).toEqual({
			leading: {
				kind: 'control-title',
				title: 'Opportunities & risks',
				control: { kind: 'meeting-date' }
			},
			actions: ['share', 'broker-switch']
		});
	});

	it('preserves the current all-activity view in the detail back link', () => {
		const header = getDashboardHeader('/all-activity/detail/deal-3m', {
			hero: { title: '3M deal' },
			headerBackHref: '/all-activity?view=need-support'
		});

		expect(header).toEqual({
			leading: {
				kind: 'control-title',
				title: '3M deal',
				control: {
					kind: 'back-link',
					href: '/all-activity?view=need-support',
					label: 'All activity'
				}
			},
			actions: ['share']
		});
	});
});
