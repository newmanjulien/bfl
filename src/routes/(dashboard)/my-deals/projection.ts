import {
	getLatestDealActivity,
	getLatestDealNews,
	sortDealActivitiesAscending,
	sortDealNewsDescending
} from '$lib/dashboard/deal-derivations';
import { getActivityLevelLabel } from '$lib/presentation/activity-level';
import { resolveOptionalBrokerPerson, toTimelineItem } from '$lib/dashboard/deal-view';
import {
	toDetailRightRailData,
	toDetailRightRailOverviewSection
} from '$lib/dashboard/detail-rail';
import type { DetailRightRailData } from '$lib/dashboard/detail-rail-model';
import type { DealRecord } from '$lib/domain/deals';
import type { NewsSource, TimelineItem } from '$lib/presentation/models';
import type { PersonSummary } from '$lib/domain/people';
import { mockDb } from '$lib/mock-db';
import type { CanvasHeroData } from '$lib/ui/custom/canvas-hero';
import type { FileUploadFieldData } from '$lib/ui/skeleton/file-upload';

export type MyDealsDetailHref = `/my-deals/detail/${string}`;

export type MyDealsRowNavigation =
	| {
			kind: 'detail';
			href: MyDealsDetailHref;
	  }
	| {
			kind: 'none';
	  };

export type MyDealsTableRow = {
	id: string;
	navigation: MyDealsRowNavigation;
	deal: string;
	latestNewsSource: NewsSource;
	latestNews: string;
	lastActivityDescription: string;
	owner: PersonSummary | null;
};

export type MyDealsNewsItem = {
	id: string;
	title: string;
	source: NewsSource;
};

export type MyDealsDetailView = {
	hero: CanvasHeroData;
	newsItems: readonly MyDealsNewsItem[];
	activityItems: readonly TimelineItem[];
	update: FileUploadFieldData;
	rightRail: DetailRightRailData;
};

function toMyDealsDetailHref(dealId: string): MyDealsDetailHref {
	return `/my-deals/detail/${dealId}`;
}

function toRightRailData(deal: DealRecord): DetailRightRailData {
	return toDetailRightRailData([toDetailRightRailOverviewSection(deal)]);
}

function toTableRow(dealId: string): MyDealsTableRow {
	const deal = mockDb.deals.requireById(dealId);
	const newsItems = sortDealNewsDescending(mockDb.news.listByDealId(dealId));
	const activityItems = sortDealActivitiesAscending(
		mockDb.activities.listByDealId(dealId, { stream: 'deal-detail' })
	);
	const latestNews = getLatestDealNews(newsItems);
	const latestActivity = getLatestDealActivity(activityItems);

	if (!latestNews || !latestActivity) {
		throw new Error(`Deal ${dealId} is missing news or activity required for my-deals.`);
	}

	const hasDetailView = mockDb.contexts.getByDealId(dealId) !== null && newsItems.length > 0;

	return {
		id: deal.dealId,
		navigation: hasDetailView
			? {
					kind: 'detail',
					href: toMyDealsDetailHref(deal.dealId)
				}
			: {
					kind: 'none'
				},
		deal: deal.dealName,
		latestNewsSource: latestNews.source,
		latestNews: latestNews.title,
		lastActivityDescription: latestActivity.body,
		owner: resolveOptionalBrokerPerson(mockDb.deals.getCurrentOwnerBrokerId(deal.dealId))
	};
}

const myDeals = mockDb
	.deals
	.list()
	.filter((deal) => mockDb.deals.getMemberBrokerIds(deal.dealId).length > 0);

export const myDealsTableRows = myDeals
	.map((deal) => toTableRow(deal.dealId));

export function getMyDealsDetailViewById(dealId: string): MyDealsDetailView | null {
	const deal = mockDb.deals.getById(dealId);
	const context = mockDb.contexts.getByDealId(dealId);

	if (!deal || !context) {
		return null;
	}

	const activityLabel = getActivityLevelLabel(deal.activityLevel).toLowerCase();
	const newsItems = sortDealNewsDescending(mockDb.news.listByDealId(dealId));
	const activityItems = sortDealActivitiesAscending(
		mockDb.activities.listByDealId(dealId, { stream: 'deal-detail' })
	);

	return {
		hero: {
			dealNumber: deal.dealNumber,
			title: deal.dealName,
			description: `${deal.dealName} is in ${deal.stage} and is ${deal.probability}% likely to close with ${activityLabel}. ${context.summary}`
		},
		newsItems: newsItems.map((newsItem) => ({
			id: newsItem.id,
			title: newsItem.title,
			source: newsItem.source
		})),
		activityItems: activityItems.map((activity) => toTimelineItem(activity)),
		update: {
			sectionId: 'update',
			uploadLabel: 'Upload files',
			uploadDescription: `Upload call notes, security review feedback, or procurement documents that add context to ${deal.dealName}.`
		},
		rightRail: toRightRailData(deal)
	};
}

export function getMyDealsDetailEntries() {
	return myDealsTableRows
		.filter((row) => row.navigation.kind === 'detail')
		.map((row) => ({
			detailId: row.id
		}));
}
