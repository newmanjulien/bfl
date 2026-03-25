import {
	DEFAULT_ALL_ACTIVITY_VIEW,
	buildAllActivityDetailHref,
	type AllActivityDetailHref,
	type AllActivityView
} from '$lib/dashboard/all-activity-routes';
import { sortDealActivitiesAscending } from '$lib/dashboard/deal-derivations';
import { getActivityLevelLabel } from '$lib/presentation/activity-level';
import { resolveOptionalBrokerPerson, toOrgChartNode, toTimelineItem } from '$lib/dashboard/deal-view';
import {
	toDetailRightRailData,
	toDetailRightRailHelpfulContactsSection,
	toDetailRightRailOverviewSection,
	toDetailRightRailTimingSection
} from '$lib/dashboard/detail-rail';
import type { DetailRightRailData } from '$lib/dashboard/detail-rail-model';
import type { ActivityLevel } from '$lib/domain/activity-level';
import type { DealContextRecord, DealRecord } from '$lib/domain/deals';
import type { IsoDateTimeString } from '$lib/domain/date-time';
import { mockDb } from '$lib/mock-db';
import type { PersonSummary } from '$lib/domain/people';
import type { OrgChartNode, TimelineItem } from '$lib/presentation/models';
import type { CanvasHeroData } from '$lib/ui/custom/canvas-hero';
import type { FileUploadFieldData } from '$lib/ui/skeleton/file-upload';

export type AllActivityDetailView = {
	hero: CanvasHeroData;
	activityItems: readonly TimelineItem[];
	orgChartRoot: OrgChartNode;
	update: FileUploadFieldData;
	rightRail: DetailRightRailData;
};

export type AllActivityRowNavigation =
	| {
			kind: 'detail';
			href: AllActivityDetailHref;
	  }
	| {
			kind: 'none';
	  };

export type AllActivityRowLastActivity =
	| {
			kind: 'relative';
			atIso: IsoDateTimeString;
	  }
	| {
			kind: 'text';
			label: string;
	  };

export type AllActivityTableRow = {
	id: string;
	navigation: AllActivityRowNavigation;
	probability: number;
	activityLevel: ActivityLevel;
	deal: string;
	stage: string;
	lastActivity: AllActivityRowLastActivity;
	owner: PersonSummary | null;
};

const NEED_SUPPORT_ROW_IDS = new Set([
	'deal-tyson',
	'deal-hilton',
	'deal-fedex'
]);

const DUPLICATED_WORK_ROW_IDS = new Set(['deal-3m']);
const NO_ACTIVITY_LABEL = 'No recorded activity';

function requireLastActivityAtIso(deal: DealRecord) {
	if (!deal.lastActivityAtIso) {
		throw new Error(`Deal ${deal.dealId} is missing lastActivityAtIso.`);
	}

	return deal.lastActivityAtIso;
}

function hasListActivityData(
	deal: DealRecord
): deal is DealRecord & {
	lastActivityAtIso: NonNullable<DealRecord['lastActivityAtIso']>;
} {
	return Boolean(deal.lastActivityAtIso);
}

function toRightRailData(deal: DealRecord, context: DealContextRecord): DetailRightRailData {
	return toDetailRightRailData([
		toDetailRightRailOverviewSection(deal),
		toDetailRightRailTimingSection(deal, context),
		toDetailRightRailHelpfulContactsSection(context)
	]);
}

function toAllActivityRowNavigation(dealId: string): AllActivityRowNavigation {
	return mockDb.contexts.getByDealId(dealId)
		? {
				kind: 'detail',
				href: buildAllActivityDetailHref(dealId, DEFAULT_ALL_ACTIVITY_VIEW)
			}
		: {
				kind: 'none'
			};
}

function toAllActivityTableRow(
	deal: DealRecord,
	lastActivity: AllActivityRowLastActivity
): AllActivityTableRow {
	return {
		id: deal.dealId,
		navigation: toAllActivityRowNavigation(deal.dealId),
		probability: deal.probability,
		activityLevel: deal.activityLevel,
		deal: deal.dealName,
		stage: deal.stage,
		lastActivity,
		owner: resolveOptionalBrokerPerson(mockDb.deals.getCurrentOwnerBrokerId(deal.dealId))
	};
}

function toRelativeLastActivityRow(deal: DealRecord & { lastActivityAtIso: IsoDateTimeString }) {
	return toAllActivityTableRow(deal, {
		kind: 'relative',
		atIso: requireLastActivityAtIso(deal)
	});
}

function toNoActivityRow(deal: DealRecord) {
	return toAllActivityTableRow(deal, {
		kind: 'text',
		label: NO_ACTIVITY_LABEL
	});
}

const allDeals = mockDb.deals.list();
const allActivityDeals = allDeals.reduce<
	Array<
		DealRecord & {
			lastActivityAtIso: NonNullable<DealRecord['lastActivityAtIso']>;
		}
	>
>((rows, deal) => {
	if (hasListActivityData(deal)) {
		rows.push(deal);
	}

	return rows;
}, []);
const noActivityDeals = allDeals.filter((deal) => !hasListActivityData(deal));

export const allActivityTableRows = allActivityDeals.map(toRelativeLastActivityRow);
export const noActivityTableRows = noActivityDeals.map(toNoActivityRow);
const allActivityTableRowsById = new Map(allActivityTableRows.map((row) => [row.id, row] as const));

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
	const rows =
		view === 'no-activity'
			? noActivityTableRows
			: (() => {
					const visibleRowIds = getVisibleAllActivityRowIds(view);

					return visibleRowIds === null
						? allActivityTableRows
						: [...visibleRowIds].flatMap((rowId) => {
								const row = allActivityTableRowsById.get(rowId);

								return row ? [row] : [];
							});
				})();

	if (view === DEFAULT_ALL_ACTIVITY_VIEW) {
		return rows;
	}

	return rows.map((row) => applyAllActivityViewToRow(row, view));
}

export function getAllActivityDetailViewById(dealId: string): AllActivityDetailView | null {
	const deal = mockDb.deals.getById(dealId);
	const context = mockDb.contexts.getByDealId(dealId);

	if (!deal || !context) {
		return null;
	}

	const activityLabel = getActivityLevelLabel(deal.activityLevel).toLowerCase();
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
		rightRail: toRightRailData(deal, context)
	};
}

export function getAllActivityDetailEntries() {
	return mockDb.contexts.list().map((context) => ({
		detailId: context.dealId
	}));
}
