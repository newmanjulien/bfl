import {
	getDealActivityLevel,
	sortDealActivitiesAscending
} from '$lib/dashboard/deal-derivations';
import { getActivityLevelLabel } from '$lib/presentation/activity-level';
import { resolveOptionalBrokerPerson, toOrgChartNode, toTimelineItem } from '$lib/dashboard/deal-view';
import { toDealDetailRightRailData } from '$lib/dashboard/detail-rail';
import type { DetailRightRailData } from '$lib/dashboard/detail-rail-model';
import type { ActivityLevel } from '$lib/domain/activity-level';
import type { DealRecord } from '$lib/domain/deals';
import type { IsoDateTimeString } from '$lib/domain/date-time';
import { mockDb } from '$lib/mock-db';
import type { PersonSummary } from '$lib/domain/people';
import type { OrgChartNode, TimelineItem } from '$lib/presentation/models';
import type { CanvasHeroData } from '$lib/ui/custom/canvas-hero';
import type { FileUploadFieldData } from '$lib/ui/skeleton/file-upload';

export const ALL_ACTIVITY_VIEW_OPTIONS = [
	{ id: 'deals', label: 'Deals' },
	{ id: 'need-support', label: 'Need support' },
	{ id: 'duplicated-work', label: 'Duplicated work' }
] as const;

export type AllActivityView = (typeof ALL_ACTIVITY_VIEW_OPTIONS)[number]['id'];

type NonDefaultAllActivityView = Exclude<AllActivityView, 'deals'>;
type AllActivityDetailPathHref = `/all-activity/detail/${string}`;

export type AllActivityDetailView = {
	hero: CanvasHeroData;
	activityItems: readonly TimelineItem[];
	orgChartRoot: OrgChartNode;
	update: FileUploadFieldData;
	rightRail: DetailRightRailData;
};

export type AllActivityListHref =
	| '/all-activity'
	| `/all-activity?view=${NonDefaultAllActivityView}`;

export type AllActivityDetailHref =
	| AllActivityDetailPathHref
	| `${AllActivityDetailPathHref}?view=${NonDefaultAllActivityView}`;

export type AllActivityRowNavigation =
	| {
			kind: 'detail';
			href: AllActivityDetailHref;
	  }
	| {
			kind: 'none';
	  };

export type AllActivityTableRow = {
	id: string;
	navigation: AllActivityRowNavigation;
	probability: number;
	activityLevel: ActivityLevel;
	deal: string;
	stage: string;
	lastActivityAtIso: IsoDateTimeString;
	owner: PersonSummary | null;
};

const DEFAULT_ALL_ACTIVITY_VIEW: AllActivityView = 'deals';

const NEED_SUPPORT_ROW_IDS = new Set([
	'deal-tyson',
	'deal-kroger',
	'deal-hilton',
	'deal-home-depot',
	'deal-costco',
	'deal-fedex',
	'deal-ups',
	'deal-lowes',
	'deal-ikea',
	'deal-united-rentals',
	'deal-sysco'
]);

const DUPLICATED_WORK_ROW_IDS = new Set([
	'deal-3m',
	'deal-costco',
	'deal-united-rentals'
]);

function toAllActivityDetailPathHref(dealId: string): AllActivityDetailPathHref {
	return `/all-activity/detail/${dealId}`;
}

export function parseAllActivityView(rawValue: string | null | undefined): AllActivityView {
	if (rawValue === 'need-support' || rawValue === 'duplicated-work') {
		return rawValue;
	}

	return DEFAULT_ALL_ACTIVITY_VIEW;
}

export function getAllActivityViewLabel(view: AllActivityView) {
	return (
		ALL_ACTIVITY_VIEW_OPTIONS.find((option) => option.id === view)?.label ??
		ALL_ACTIVITY_VIEW_OPTIONS[0].label
	);
}

export function buildAllActivityListHref(view: AllActivityView): AllActivityListHref {
	if (view === DEFAULT_ALL_ACTIVITY_VIEW) {
		return '/all-activity';
	}

	if (view === 'need-support') {
		return '/all-activity?view=need-support';
	}

	return '/all-activity?view=duplicated-work';
}

export function buildAllActivityDetailHref(
	dealId: string,
	view: AllActivityView
): AllActivityDetailHref {
	const detailPathHref = toAllActivityDetailPathHref(dealId);

	if (view === DEFAULT_ALL_ACTIVITY_VIEW) {
		return detailPathHref;
	}

	return `${detailPathHref}?view=${view}` as AllActivityDetailHref;
}

function requireActivityLevel(deal: DealRecord) {
	const activityLevel = getDealActivityLevel(deal);

	if (!activityLevel) {
		throw new Error(`Deal ${deal.dealId} is missing an activity trend.`);
	}

	return activityLevel;
}

function requireLastActivityAtIso(deal: DealRecord) {
	if (!deal.lastActivityAtIso) {
		throw new Error(`Deal ${deal.dealId} is missing lastActivityAtIso.`);
	}

	return deal.lastActivityAtIso;
}

function hasDetailActivityData(
	deal: DealRecord
): deal is DealRecord & {
	activityTrend: NonNullable<DealRecord['activityTrend']>;
	lastActivityAtIso: NonNullable<DealRecord['lastActivityAtIso']>;
} {
	return Boolean(deal.activityTrend && deal.lastActivityAtIso);
}

function toRightRailData(deal: DealRecord): DetailRightRailData {
	const rightRail = toDealDetailRightRailData(deal.dealId);

	if (!rightRail) {
		throw new Error(`Deal ${deal.dealId} is missing detail context or activity trend.`);
	}

	return rightRail;
}

function toAllActivityTableRow(deal: DealRecord): AllActivityTableRow {
	return {
		id: deal.dealId,
		navigation: mockDb.contexts.getByDealId(deal.dealId)
			? {
					kind: 'detail',
					href: buildAllActivityDetailHref(deal.dealId, DEFAULT_ALL_ACTIVITY_VIEW)
				}
			: {
					kind: 'none'
				},
		probability: deal.probability,
		activityLevel: requireActivityLevel(deal),
		deal: deal.dealName,
		stage: deal.stage,
		lastActivityAtIso: requireLastActivityAtIso(deal),
		owner: resolveOptionalBrokerPerson(mockDb.deals.getCurrentOwnerBrokerId(deal.dealId))
	};
}

const allActivityDeals = mockDb
	.deals
	.list()
	.filter(hasDetailActivityData);

export const allActivityTableRows = allActivityDeals.map(toAllActivityTableRow);

function applyAllActivityViewToRow(
	row: AllActivityTableRow,
	view: AllActivityView
): AllActivityTableRow {
	if (row.navigation.kind !== 'detail') {
		return row;
	}

	const href = buildAllActivityDetailHref(row.id, view);

	if (row.navigation.href === href) {
		return row;
	}

	return {
		...row,
		navigation: {
			kind: 'detail',
			href
		}
	};
}

function getVisibleAllActivityRowIds(view: AllActivityView) {
	if (view === 'need-support') {
		return NEED_SUPPORT_ROW_IDS;
	}

	if (view === 'duplicated-work') {
		return DUPLICATED_WORK_ROW_IDS;
	}

	return null;
}

export function getAllActivityRowsForView(view: AllActivityView) {
	const visibleRowIds = getVisibleAllActivityRowIds(view);
	const rows =
		visibleRowIds === null
			? allActivityTableRows
			: allActivityTableRows.filter((row) => visibleRowIds.has(row.id));

	if (view === DEFAULT_ALL_ACTIVITY_VIEW) {
		return rows;
	}

	return rows.map((row) => applyAllActivityViewToRow(row, view));
}

export function getAllActivityDetailViewById(dealId: string): AllActivityDetailView | null {
	const deal = mockDb.deals.getById(dealId);
	const context = mockDb.contexts.getByDealId(dealId);

	if (!deal || !context || !deal.activityTrend) {
		return null;
	}

	const activityLevel = requireActivityLevel(deal);
	const activityLabel = getActivityLevelLabel(activityLevel).toLowerCase();
	const activityItems = sortDealActivitiesAscending(
		mockDb.activities.listByDealId(deal.dealId, { stream: 'deal-detail' })
	).map((activity) => toTimelineItem(activity));

	return {
		hero: {
			dealNumber: deal.dealNumber,
			title: deal.dealName,
			description: `${deal.dealName} is in ${deal.stage} and is ${deal.probability}% likely to close with ${activityLabel}. ${context.summary}`
		},
		activityItems,
		orgChartRoot: toOrgChartNode(context.orgChartRoot),
		update: {
			sectionId: 'update',
			uploadLabel: 'Upload files',
			uploadDescription: `Upload call notes, security review feedback, or procurement documents that add context to ${deal.dealName}.`
		},
		rightRail: toRightRailData(deal)
	};
}

export function getAllActivityDetailEntries() {
	return mockDb.contexts.list().map((context) => ({
		detailId: context.dealId
	}));
}
