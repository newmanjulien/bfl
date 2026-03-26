import {
	getLatestDealActivity,
	getLatestDealNews,
	sortDealActivitiesAscending,
	sortDealNewsDescending
} from '$lib/dashboard/deal-derivations';
import {
	DEFAULT_MY_DEALS_VIEW,
	buildMyDealsDetailHref,
	type MyDealsDetailHref,
	type MyDealsView
} from '$lib/dashboard/my-deals-routes';
import type { IsoDateString } from '$lib/domain/date-time';
import { getActivityLevelLabel } from '$lib/presentation/activity-level';
import { resolveOptionalBrokerPerson, toTimelineItem } from '$lib/dashboard/deal-view';
import {
	toDetailRightRailData,
	toDetailRightRailOverviewSection
} from '$lib/dashboard/detail-rail';
import type { DetailRightRailData } from '$lib/dashboard/detail-rail-model';
import type { DealNewsRecord, DealRecord } from '$lib/domain/deals';
import type { NewsSource, TimelineItem } from '$lib/presentation/models';
import type { PersonSummary } from '$lib/domain/people';
import { mockDb } from '$lib/mock-db';
import type { CanvasHeroData } from '$lib/ui/custom/canvas-hero';
import type { FileUploadFieldData } from '$lib/ui/skeleton/file-upload';

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
	publishedOnIso: IsoDateString;
};

export type MyDealsDetailView = {
	hero: CanvasHeroData;
	newsItems: readonly MyDealsNewsItem[];
	activityItems: readonly TimelineItem[];
	update: FileUploadFieldData;
	rightRail: DetailRightRailData;
};

function toMyDealsNewsItem(newsItem: DealNewsRecord): MyDealsNewsItem {
	return {
		id: newsItem.id,
		title: newsItem.title,
		source: newsItem.source,
		publishedOnIso: newsItem.publishedOnIso
	};
}

function toRightRailData(deal: DealRecord): DetailRightRailData {
	return toDetailRightRailData([toDetailRightRailOverviewSection(deal)]);
}

function hasMyDealsDetailView(dealId: string) {
	return mockDb.contexts.getByDealId(dealId) !== null && mockDb.news.listByDealId(dealId).length > 0;
}

function toUtcIsoDate(date: Date): IsoDateString {
	return date.toISOString().slice(0, 10) as IsoDateString;
}

function getWeekStartIso(isoDate: IsoDateString) {
	const date = new Date(`${isoDate}T00:00:00Z`);
	const day = date.getUTCDay();
	const daysSinceMonday = day === 0 ? 6 : day - 1;

	date.setUTCDate(date.getUTCDate() - daysSinceMonday);

	return toUtcIsoDate(date);
}

function isInSameWeek(leftIso: IsoDateString, rightIso: IsoDateString) {
	return getWeekStartIso(leftIso) === getWeekStartIso(rightIso);
}

function toTableRow(dealId: string, selectedView: MyDealsView): MyDealsTableRow {
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

	const hasDetailView = hasMyDealsDetailView(dealId);

	return {
		id: deal.dealId,
		navigation: hasDetailView
			? {
					kind: 'detail',
					href: buildMyDealsDetailHref(deal.dealId, selectedView)
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

export function getMyDealsTableRowsForView(selectedView: MyDealsView = DEFAULT_MY_DEALS_VIEW) {
	return myDeals.map((deal) => toTableRow(deal.dealId, selectedView));
}

export const myDealsTableRows = getMyDealsTableRowsForView('deals');

export function getMyDealsNewsItems() {
	const sortedNews = sortDealNewsDescending(
		myDeals
			.filter((deal) => hasMyDealsDetailView(deal.dealId))
			.flatMap((deal) => mockDb.news.listByDealId(deal.dealId))
	);
	const referencePublishedOnIso = sortedNews[0]?.publishedOnIso;

	if (!referencePublishedOnIso) {
		return [];
	}

	return sortedNews
		.filter((newsItem) => isInSameWeek(newsItem.publishedOnIso, referencePublishedOnIso))
		.map((newsItem) => toMyDealsNewsItem(newsItem));
}

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
		newsItems: newsItems.map((newsItem) => toMyDealsNewsItem(newsItem)),
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
	return myDeals
		.filter((deal) => hasMyDealsDetailView(deal.dealId))
		.map((deal) => ({
			detailId: deal.dealId
		}));
}
