import {
	toOrgChartNode,
	toTimelineItem
} from '$lib/dashboard/deal-view';
import { toDealDetailRightRailData, toMetadataDetailRightRailData } from '$lib/dashboard/detail-rail';
import type { DetailRightRailData } from '$lib/dashboard/detail-rail-model';
import type { ActivityLevel } from '$lib/domain/activity-level';
import type { DealInsightKind } from '$lib/domain/deals';
import { mockDb, type BrokerId } from '$lib/mock-db';
import type { OrgChartNode, TimelineItem } from '$lib/presentation/models';
import type { CanvasHeroData } from '$lib/ui/custom/canvas-hero';
import type { FileUploadFieldData } from '$lib/ui/skeleton/file-upload';

export type OpportunityKind = DealInsightKind;
type OpportunityTileAvatars = readonly [string, ...string[]];

export type OpportunityDetailHref = `/opportunities/detail/${string}`;

export type OpportunityTile = {
	id: string;
	href: OpportunityDetailHref;
	title: string;
	description?: string;
	iconKind: OpportunityKind;
	dealNumber: number;
	dealLabel?: string;
	avatars?: OpportunityTileAvatars;
	activityLevel?: ActivityLevel;
};

export type OpportunityDetailView = {
	hero: CanvasHeroData;
	activityItems: readonly TimelineItem[];
	orgChartRoot: OrgChartNode;
	update: FileUploadFieldData;
	rightRail: DetailRightRailData;
};

function toOpportunityDetailHref(insightId: string): OpportunityDetailHref {
	return `/opportunities/detail/${insightId}`;
}

function getOwnerAvatars(ownerIds: readonly [BrokerId, ...BrokerId[]]): OpportunityTileAvatars {
	const [firstOwnerId, ...remainingOwnerIds] = ownerIds;
	const firstAvatar = mockDb.brokers.getById(firstOwnerId).avatar;

	return [
		firstAvatar,
		...remainingOwnerIds.map((ownerId) => mockDb.brokers.getById(ownerId).avatar)
	];
}

function toTile(insightId: string): OpportunityTile {
	const insight = mockDb.insights.requireById(insightId);
	const deal = mockDb.deals.requireById(insight.dealId);

	return {
		id: insight.id,
		href: toOpportunityDetailHref(insight.id),
		title: insight.title,
		description: insight.summary,
		iconKind: insight.kind,
		dealNumber: deal.dealNumber,
		dealLabel: deal.accountName,
		avatars: getOwnerAvatars(insight.ownerBrokerIds),
		activityLevel: insight.activityLevel
	};
}

function toSummaryRightRailData(insightId: string): DetailRightRailData {
	const insight = mockDb.insights.requireById(insightId);
	const deal = mockDb.deals.requireById(insight.dealId);
	const rightRail = toMetadataDetailRightRailData(deal.dealId, {
		activityLevel: insight.activityLevel,
		limitation: 'missing-detail-context'
	});

	if (!rightRail) {
		throw new Error(`Opportunity detail ${insightId} is missing the data required for metadata rail.`);
	}

	return rightRail;
}

function toDetailView(insightId: string): OpportunityDetailView | null {
	const insight = mockDb.insights.getById(insightId);

	if (!insight) {
		return null;
	}

	const deal = mockDb.deals.requireById(insight.dealId);
	const rightRail = toDealDetailRightRailData(deal.dealId) ?? toSummaryRightRailData(insight.id);

	return {
		hero: {
			dealNumber: deal.dealNumber,
			title: insight.title,
			description: insight.summary,
			iconKind: insight.kind
		},
		activityItems: insight.timeline.map((activity) => toTimelineItem(activity)),
		orgChartRoot: toOrgChartNode(insight.orgChartRoot),
		update: {
			sectionId: 'update',
			uploadLabel: 'Upload files',
			uploadDescription:
				'Upload call notes, screenshots, or procurement docs that add context to this opportunity or risk.'
		},
		rightRail
	};
}

const opportunityInsights = mockDb.insights.list({ kind: 'opportunity' });
const riskInsights = mockDb.insights.list({ kind: 'risk' });

export const opportunitiesTiles = opportunityInsights.map((insight) => toTile(insight.id));
export const opportunityRiskTiles = riskInsights.map((insight) => toTile(insight.id));

export function getOpportunityDetailViewById(insightId: string): OpportunityDetailView | null {
	return toDetailView(insightId);
}

export function getOpportunityDetailEntries() {
	return mockDb.insights.listIds().map((detailId) => ({ detailId }));
}
