import type { DashboardHeader } from '$lib/dashboard/shell/header/types';
import type {
	InternalLink,
	MyDealsDetailRouteRef,
	MyDealsListRouteRef,
	Navigation
} from '$lib/dashboard/routing';
import type { CanvasHeroData } from '$lib/dashboard/ui/detail/CanvasHero.types';
import type {
	MyDealsDetailReadModel,
	MyDealsDetailRef,
	MyDealsFeedItemReadModel,
	MyDealsListReadModel
} from '$lib/dashboard/read-models';
import { createMyDealsDetailHeader, createMyDealsListHeader } from './headers';

const MY_DEALS_NEWS_HERO = {
	title: "This week's news",
	description:
		"Get a quick overview of this week's news across the deals you are working on."
} as const satisfies CanvasHeroData;

function toDetailNavigation(
	route: MyDealsListRouteRef,
	detail: MyDealsDetailRef | null
): Navigation<MyDealsDetailRouteRef> {
	if (!detail) {
		return {
			kind: 'none'
		};
	}

	return {
		kind: 'internal',
		route: {
			kind: 'my-deals-detail',
			dealId: detail.dealId,
			view: route.view,
			tab: detail.defaultTab
		}
	};
}

function toFeedItemNavigation(
	route: MyDealsListRouteRef,
	item: MyDealsFeedItemReadModel
): InternalLink<MyDealsDetailRouteRef> | { kind: 'none' } {
	if (item.kind !== 'activity') {
		return {
			kind: 'none'
		};
	}

	return {
		kind: 'internal',
		route: {
			kind: 'my-deals-detail',
			dealId: item.detail.dealId,
			view: route.view,
			tab: item.detail.defaultTab
		}
	};
}

export type MyDealsFeedItemPageData = {
	id: string;
	title: string;
	kind: MyDealsFeedItemReadModel['kind'];
	dateIso: MyDealsFeedItemReadModel['dateIso'];
	navigation: InternalLink<MyDealsDetailRouteRef> | { kind: 'none' };
};

export type MyDealsTableRowPageData = Omit<MyDealsListReadModel['rows'][number], 'detail'> & {
	navigation: Navigation<MyDealsDetailRouteRef>;
};

export type MyDealsListPageData = {
	route: MyDealsListRouteRef;
	header: DashboardHeader;
	hero?: CanvasHeroData;
	rows: MyDealsTableRowPageData[];
	newsItems: MyDealsFeedItemPageData[];
	watchlistItems: MyDealsFeedItemPageData[];
};

export type MyDealsDetailPageData = {
	route: MyDealsDetailRouteRef;
	header: DashboardHeader;
	hero: MyDealsDetailReadModel['hero'];
	newsItems: MyDealsFeedItemPageData[];
	activityItems: MyDealsDetailReadModel['activityItems'];
	update: MyDealsDetailReadModel['update'];
	rightRail: MyDealsDetailReadModel['rightRail'];
};

export function buildMyDealsListPageData(params: {
	route: MyDealsListRouteRef;
	readModel: MyDealsListReadModel;
}): MyDealsListPageData {
	const { route, readModel } = params;

	return {
		route,
		header: createMyDealsListHeader(route.view),
		hero: route.view === 'news' ? MY_DEALS_NEWS_HERO : undefined,
		rows: readModel.rows.map((row) => ({
			...row,
			navigation: toDetailNavigation(route, row.detail)
		})),
		newsItems: readModel.newsItems.map((item) => ({
			id: item.id,
			title: item.title,
			kind: item.kind,
			dateIso: item.dateIso,
			navigation: toFeedItemNavigation(route, item)
		})),
		watchlistItems: readModel.watchlistItems.map((item) => ({
			id: item.id,
			title: item.title,
			kind: item.kind,
			dateIso: item.dateIso,
			navigation: toFeedItemNavigation(route, item)
		}))
	};
}

export function buildMyDealsDetailPageData(params: {
	route: MyDealsDetailRouteRef;
	readModel: MyDealsDetailReadModel;
}): MyDealsDetailPageData {
	const { route, readModel } = params;

	return {
		route,
		header: createMyDealsDetailHeader(readModel.title, route.view),
		hero: readModel.hero,
		newsItems: readModel.newsItems.map((item) => ({
			id: item.id,
			title: item.title,
			kind: item.kind,
			dateIso: item.dateIso,
			navigation: {
				kind: 'none'
			}
		})),
		activityItems: readModel.activityItems,
		update: readModel.update,
		rightRail: readModel.rightRail
	};
}
