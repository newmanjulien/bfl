import {
	toOrgChartNode,
	toTimelineItem
} from '$lib/dashboard/deal-view';
import {
	toDetailRightRailData,
	toDetailRightRailOverviewSection
} from '$lib/dashboard/detail-rail';
import type { DetailRightRailData } from '$lib/dashboard/detail-rail-model';
import type { ActivityLevel } from '$lib/domain/activity-level';
import type { DealInsightKind, DealInsightRecord, DealRecord } from '$lib/domain/deals';
import { mockDb, type BrokerId } from '$lib/mock-db';
import type { OrgChartNode, TimelineItem } from '$lib/presentation/models';
import type { CanvasHeroData } from '$lib/ui/custom/canvas-hero';
import type { FileUploadFieldData } from '$lib/ui/skeleton/file-upload';

export type OpportunityKind = DealInsightKind;
type OpportunityTileAvatars = readonly [string, ...string[]];
type DealInsightEntry = {
	deal: DealRecord<BrokerId>;
	insight: DealInsightRecord<BrokerId>;
};

export type OpportunityDetailHref = `/opportunities/detail/${string}`;

export type OpportunityTile = {
	id: string;
	href: OpportunityDetailHref;
	title: string;
	dealNumber: number;
	dealLabel?: string;
	avatars?: OpportunityTileAvatars;
	activityLevel: ActivityLevel;
};

export type OpportunityDetailView = {
	hero: CanvasHeroData;
	kind: OpportunityKind;
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

function listDealInsightEntries(kind?: DealInsightKind) {
	return mockDb.deals.list().flatMap<DealInsightEntry>((deal) =>
		(deal.insights ?? [])
			.filter((insight) => !kind || insight.kind === kind)
			.map((insight) => ({ deal, insight }))
	);
}

function getDealInsightEntryById(insightId: string) {
	return allDealInsightEntries.find((entry) => entry.insight.id === insightId) ?? null;
}

function toTile(entry: DealInsightEntry): OpportunityTile {
	const { deal, insight } = entry;

	return {
		id: insight.id,
		href: toOpportunityDetailHref(insight.id),
		title: insight.title,
		dealNumber: deal.dealNumber,
		dealLabel: deal.accountName,
		avatars: getOwnerAvatars(insight.ownerBrokerIds),
		activityLevel: deal.activityLevel
	};
}

function toRightRailData(deal: DealRecord): DetailRightRailData {
	return toDetailRightRailData([toDetailRightRailOverviewSection(deal)]);
}

function toDetailView(insightId: string): OpportunityDetailView | null {
	const entry = getDealInsightEntryById(insightId);

	if (!entry) {
		return null;
	}

	const { deal, insight } = entry;
	const rightRail = toRightRailData(deal);

	return {
		hero: {
			dealNumber: deal.dealNumber,
			title: insight.title
		},
		kind: insight.kind,
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

const allDealInsightEntries = listDealInsightEntries();
const opportunityInsights = listDealInsightEntries('opportunity');
const riskInsights = listDealInsightEntries('risk');

export const opportunitiesTiles = opportunityInsights.map((entry) => toTile(entry));
export const opportunityRiskTiles = riskInsights.map((entry) => toTile(entry));

export function getOpportunityDetailViewById(insightId: string): OpportunityDetailView | null {
	return toDetailView(insightId);
}

export function getOpportunityDetailEntries() {
	return allDealInsightEntries.map(({ insight }) => ({ detailId: insight.id }));
}
