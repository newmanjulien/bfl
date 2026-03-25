import { activeMeetingDateIso } from '$lib/dashboard/meeting-date';
import {
	buildAllActivityDetailHref,
	buildAllActivityListHref,
	isNonDefaultAllActivityView
} from '$lib/dashboard/all-activity-routes';
import type { DetailRightRailData } from '$lib/dashboard/detail-rail-model';
import { getDashboardHeader } from '$lib/dashboard/shell/dashboard-header';
import { mockDb } from '$lib/mock-db';
import { describe, expect, it } from 'vitest';
import {
	allActivityTableRows,
	getAllActivityDetailViewById,
	getAllActivityRowsForView
} from './all-activity/projection';
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

function getRightRailRow(rightRail: DetailRightRailData, rowId: string) {
	return rightRail.sections
		.flatMap((section) => (section.kind === 'rows' ? section.rows : []))
		.find((row) => row.id === rowId) ?? null;
}

function getRowsSection(rightRail: DetailRightRailData, sectionId: string) {
	const section = rightRail.sections.find((candidate) => candidate.id === sectionId);

	return section?.kind === 'rows' ? section : null;
}

function getHelpfulContactsSection(rightRail: DetailRightRailData) {
	const section = rightRail.sections.find((candidate) => candidate.id === 'helpful-contacts');

	return section?.kind === 'helpful-contacts' ? section : null;
}

describe('dashboard data adapters', () => {
	it('renders unassigned owners cleanly in deal list projections', () => {
		expect(allActivityTableRows.find((row) => row.id === 'deal-fedex')?.owner).toBeNull();
		expect(myDealsTableRows.find((row) => row.id === 'deal-fedex')?.owner).toBeNull();
	});

	it('uses the route view as the source of truth for all-activity tables', () => {
		expect(getAllActivityRowsForView('deals')).toEqual(allActivityTableRows);
		expect(getAllActivityRowsForView('need-support').map((row) => row.id)).toEqual([
			'deal-tyson',
			'deal-hilton',
			'deal-fedex'
		]);
		expect(getAllActivityRowsForView('duplicated-work').map((row) => row.id)).toEqual(['deal-3m']);
		expect(isNonDefaultAllActivityView('need-support')).toBe(true);
		expect(isNonDefaultAllActivityView('duplicated-work')).toBe(true);
		expect(isNonDefaultAllActivityView('deals')).toBe(false);
		expect(isNonDefaultAllActivityView('unexpected-view')).toBe(false);
		expect(buildAllActivityListHref('deals')).toBe('/all-activity');
		expect(buildAllActivityListHref('need-support')).toBe('/all-activity/need-support');
		expect(buildAllActivityDetailHref('deal-3m', 'deals')).toBe('/all-activity/detail/deal-3m');
		expect(buildAllActivityDetailHref('deal-3m', 'duplicated-work')).toBe(
			'/all-activity/duplicated-work/detail/deal-3m'
		);
		expect(getAllActivityRowsForView('duplicated-work')[0]?.navigation).toEqual({
			kind: 'detail',
			href: '/all-activity/duplicated-work/detail/deal-3m'
		});
	});

	it('uses the canonical deal number for deal detail views', () => {
		const allActivityDetail = getAllActivityDetailViewById('deal-3m');
		const myDealsDetail = getMyDealsDetailViewById('deal-3m');
		const allActivityDealNumberRow = allActivityDetail
			? getRightRailRow(allActivityDetail.rightRail, 'deal-number')
			: null;
		const myDealsDealNumberRow = myDealsDetail
			? getRightRailRow(myDealsDetail.rightRail, 'deal-number')
			: null;

		expect(allActivityDetail?.hero.dealNumber).toBe(74);
		expect(myDealsDetail?.hero.dealNumber).toBe(74);
		expect('metaId' in (allActivityDetail?.hero ?? {})).toBe(false);
		expect(allActivityDealNumberRow?.kind).toBe('deal-number');
		expect(myDealsDealNumberRow?.kind).toBe('deal-number');

		if (allActivityDealNumberRow?.kind !== 'deal-number' || myDealsDealNumberRow?.kind !== 'deal-number') {
			throw new Error('Expected detail rails to include a deal-number row.');
		}

		expect(allActivityDealNumberRow.dealNumber).toBe(74);
		expect(myDealsDealNumberRow.dealNumber).toBe(74);
	});

	it('only opts helpful contacts into all-activity detail rails', () => {
		const allActivityDetail = getAllActivityDetailViewById('deal-3m');
		const myDealsDetail = getMyDealsDetailViewById('deal-3m');
		const helpfulContacts = allActivityDetail
			? getHelpfulContactsSection(allActivityDetail.rightRail)?.contacts
			: undefined;

		expect(helpfulContacts).toBeDefined();
		expect(helpfulContacts).toHaveLength(3);

		for (const contact of helpfulContacts ?? []) {
			expect(contact.title).toBeTruthy();
			expect(contact.company).toBeTruthy();
			expect(contact.linkedInUrl).toMatch(/^https:\/\/www\.linkedin\.com\/in\//);
		}

		expect(myDealsDetail ? getHelpfulContactsSection(myDealsDetail.rightRail) : null).toBeNull();
	});

	it('uses the parent deal number for opportunity and risk views', () => {
		const opportunityTile = opportunitiesTiles.find((tile) => tile.id === 'insight-118');
		const riskTile = opportunityRiskTiles.find((tile) => tile.id === 'insight-119');
		const riskDetail = getOpportunityDetailViewById('insight-119');
		const riskDealNumberRow = riskDetail ? getRightRailRow(riskDetail.rightRail, 'deal-number') : null;

		expect(opportunityTile?.dealNumber).toBe(118);
		expect(riskTile?.dealNumber).toBe(74);
		expect(riskDetail?.hero.dealNumber).toBe(74);
		expect(riskDealNumberRow?.kind).toBe('deal-number');

		if (riskDealNumberRow?.kind !== 'deal-number') {
			throw new Error('Expected risk detail rail to include a deal-number row.');
		}

		expect(riskDealNumberRow.dealNumber).toBe(74);
	});

	it('builds opportunity detail rails from explicit sections only', () => {
		const opportunityDetail = getOpportunityDetailViewById('insight-118');
		const opportunityDealNumberRow = opportunityDetail
			? getRightRailRow(opportunityDetail.rightRail, 'deal-number')
			: null;

		expect(opportunityDetail?.hero.dealNumber).toBe(118);
		expect(opportunityDetail).not.toBeNull();

		if (!opportunityDetail) {
			throw new Error('Expected a detail view for the Honeywell opportunity.');
		}

		expect(opportunityDetail.rightRail.sections).toHaveLength(1);
		expect(getRowsSection(opportunityDetail.rightRail, 'deal-overview')).not.toBeNull();
		expect(getRowsSection(opportunityDetail.rightRail, 'deal-timing')).toBeNull();
		expect(getHelpfulContactsSection(opportunityDetail.rightRail)).toBeNull();
		expect(getRightRailRow(opportunityDetail.rightRail, 'claimed')).toBeNull();
		expect(getRightRailRow(opportunityDetail.rightRail, 'last-activity')).toBeNull();
		expect(opportunityDealNumberRow?.kind).toBe('deal-number');

		if (opportunityDealNumberRow?.kind !== 'deal-number') {
			throw new Error('Expected opportunity detail rail to include a deal-number row.');
		}

		expect(opportunityDealNumberRow.dealNumber).toBe(118);
	});

	it('derives since-last-meeting screens from canonical deal data', () => {
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
		expect(sinceLastMeetingDeals.map((deal) => deal.activityLevel)).toEqual([
			'high',
			'low',
			'high'
		]);
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
			extra: { kind: 'add-deal' }
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
					href: '/all-activity/need-support',
					current: true
				}
			]
		};
		const header = getDashboardHeader('/all-activity/need-support', {
			headerTitleMenu: titleMenu
		});

		expect(header).toEqual({
			leading: {
				kind: 'title-menu',
				title: 'All activity',
				menu: titleMenu
			},
			actions: ['share'],
			extra: {
				kind: 'filters',
				filters: ['broker', 'activity-level']
			}
		});
	});

	it('renders dashboard overview routes as control-title headers', () => {
		expect(getDashboardHeader('/since-last-meeting')).toEqual({
			leading: {
				kind: 'control-title',
				title: 'Since last meeting',
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
		const header = getDashboardHeader('/all-activity/duplicated-work/detail/deal-3m', {
			hero: { title: '3M deal' },
			headerBackHref: '/all-activity/need-support'
		});

		expect(header).toEqual({
			leading: {
				kind: 'control-title',
				title: '3M deal',
				control: {
					kind: 'back-link',
					href: '/all-activity/need-support',
					label: 'All activity'
				}
			},
			actions: ['share']
		});
	});
});
