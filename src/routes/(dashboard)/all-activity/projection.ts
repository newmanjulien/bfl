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

export type AllActivityDetailView = {
	hero: CanvasHeroData;
	activityItems: readonly TimelineItem[];
	orgChartRoot: OrgChartNode;
	update: FileUploadFieldData;
	rightRail: DetailRightRailData;
};

export type AllActivityDetailHref = `/all-activity/detail/${string}`;

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

function toAllActivityDetailHref(dealId: string): AllActivityDetailHref {
	return `/all-activity/detail/${dealId}`;
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
					href: toAllActivityDetailHref(deal.dealId)
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
			description: `${deal.dealName} is in ${deal.stage} and is ${deal.probability}% likely to close with ${activityLabel}. ${context.summary}`,
			iconKind: 'list'
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
