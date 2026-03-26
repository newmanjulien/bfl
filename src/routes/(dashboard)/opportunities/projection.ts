import {
	createPersonSummaryMap,
	resolveBrokerPerson,
	resolveOptionalBrokerPerson,
	type PersonSummaryMap,
	toOrgChartNode,
	toTimelineItem
} from '$lib/dashboard/deal-view';
import {
	toDetailRightRailData,
	toDetailRightRailOverviewSection
} from '$lib/dashboard/detail-rail';
import type { DetailRightRailData } from '$lib/dashboard/detail-rail-model';
import type { ActivityLevel } from '$lib/domain/activity-level';
import type {
	DealInsightKind,
	DealInsightRecord,
	DealSnapshotRecord
} from '$lib/domain/deals';
import { mockDb } from '$lib/mock-db';
import type { OrgChartNode, TimelineItem } from '$lib/presentation/models';
import type { CanvasHeroData } from '$lib/ui/custom/canvas-hero';
import type { FileUploadFieldData } from '$lib/ui/skeleton/file-upload';

export type OpportunityKind = DealInsightKind;
type OpportunityTileAvatars = readonly [string, ...string[]];
type DealInsightEntry = {
	deal: DealSnapshotRecord;
	insight: DealInsightRecord;
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

function createPeopleById() {
	return createPersonSummaryMap(mockDb.brokers.list());
}

function resolveDealOwner(
	dealId: string,
	peopleById: PersonSummaryMap
) {
	return resolveOptionalBrokerPerson(peopleById, mockDb.deals.getCurrentOwnerBrokerId(dealId));
}

function toOpportunityDetailHref(insightId: string): OpportunityDetailHref {
	return `/opportunities/detail/${insightId}`;
}

function getOwnerAvatars(
	ownerIds: readonly [string, ...string[]],
	peopleById: PersonSummaryMap
): OpportunityTileAvatars {
	const [firstOwnerId, ...remainingOwnerIds] = ownerIds;
	const firstAvatar = resolveBrokerPerson(peopleById, firstOwnerId).avatar;

	return [
		firstAvatar,
		...remainingOwnerIds.map((ownerId) => resolveBrokerPerson(peopleById, ownerId).avatar)
	];
}

function listDealInsightEntries(kind?: DealInsightKind) {
	return mockDb.insights
		.list(kind ? { kind } : undefined)
		.map<DealInsightEntry>((insight) => ({
			deal: mockDb.deals.requireById(insight.dealId),
			insight
		}));
}

function getDealInsightEntryById(insightId: string) {
	const insight = mockDb.insights.getById(insightId);

	if (!insight) {
		return null;
	}

	const deal = mockDb.deals.getById(insight.dealId);

	if (!deal) {
		throw new Error(`Unknown deal "${insight.dealId}" for insight "${insight.id}".`);
	}

	return {
		deal,
		insight
	};
}

function toTile(
	entry: DealInsightEntry,
	peopleById: PersonSummaryMap
): OpportunityTile {
	const { deal, insight } = entry;

	return {
		id: insight.id,
		href: toOpportunityDetailHref(insight.id),
		title: insight.title,
		dealNumber: deal.dealNumber,
		dealLabel: deal.accountName,
		avatars: getOwnerAvatars(insight.ownerBrokerIds, peopleById),
		activityLevel: deal.activityLevel
	};
}

function toRightRailData(
	deal: DealSnapshotRecord,
	peopleById: PersonSummaryMap
): DetailRightRailData {
	return toDetailRightRailData([
		toDetailRightRailOverviewSection(deal, resolveDealOwner(deal.dealId, peopleById))
	]);
}

function toDetailView(insightId: string): OpportunityDetailView | null {
	const entry = getDealInsightEntryById(insightId);

	if (!entry) {
		return null;
	}

	const peopleById = createPeopleById();
	const { deal, insight } = entry;
	const rightRail = toRightRailData(deal, peopleById);

	return {
		hero: {
			dealNumber: deal.dealNumber,
			title: insight.title
		},
		kind: insight.kind,
		activityItems: insight.timeline.map((activity) => toTimelineItem(activity, peopleById)),
		orgChartRoot: toOrgChartNode(insight.orgChartRoot, peopleById),
		update: {
			sectionId: 'update',
			uploadLabel: 'Upload files',
			uploadDescription:
				'Upload call notes, screenshots, or procurement docs that add context to this opportunity or risk.'
		},
		rightRail
	};
}

export function getOpportunityTiles() {
	const peopleById = createPeopleById();

	return listDealInsightEntries('opportunity').map((entry) => toTile(entry, peopleById));
}

export function getOpportunityRiskTiles() {
	const peopleById = createPeopleById();

	return listDealInsightEntries('risk').map((entry) => toTile(entry, peopleById));
}

export function getOpportunityDetailViewById(insightId: string): OpportunityDetailView | null {
	return toDetailView(insightId);
}

export function getOpportunityDetailEntries() {
	return mockDb.insights.list().map(({ id }) => ({ detailId: id }));
}
