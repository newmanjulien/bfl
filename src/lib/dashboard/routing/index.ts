import type { AbsoluteUrl } from '$lib/types/url';
import {
	DEFAULT_ALL_ACTIVITY_VIEW,
	isNonDefaultAllActivityView,
	type NonDefaultAllActivityView,
	type AllActivityView
} from './all-activity';
import {
	DEFAULT_MY_DEALS_DETAIL_TAB_ID,
	DEFAULT_MY_DEALS_VIEW,
	isMyDealsDetailTabId,
	isNonDefaultMyDealsView,
	type NonDefaultMyDealsView,
	type MyDealsDetailTabId,
	type MyDealsView
} from './my-deals';

const MY_DEALS_BASE_PATH = '/my-deals';
const ALL_ACTIVITY_BASE_PATH = '/all-activity';
const OPPORTUNITIES_BASE_PATH = '/opportunities';
const SINCE_LAST_MEETING_PATH = '/since-last-meeting';

const DASHBOARD_ROUTE_IDS = {
	myDealsList: ['/(dashboard)/my-deals', '/(dashboard)/my-deals/[view=myDealsView]'],
	myDealsDetail: [
		'/(dashboard)/my-deals/detail/[detailId]',
		'/(dashboard)/my-deals/[view=myDealsView]/detail/[detailId]'
	],
	allActivityList: ['/(dashboard)/all-activity', '/(dashboard)/all-activity/[view=allActivityView]'],
	allActivityDetail: [
		'/(dashboard)/all-activity/detail/[detailId]',
		'/(dashboard)/all-activity/[view=allActivityView]/detail/[detailId]'
	],
	opportunities: ['/(dashboard)/opportunities', '/(dashboard)/opportunities/detail/[detailId]'],
	sinceLastMeeting: ['/(dashboard)/since-last-meeting']
} as const;

export type DashboardDealRouteParam = string;
export type DashboardInsightRouteParam = string;

export type MyDealsListRouteRef = {
	kind: 'my-deals-list';
	view: MyDealsView;
};

export type MyDealsDetailRouteRef = {
	kind: 'my-deals-detail';
	dealId: DashboardDealRouteParam;
	view: MyDealsView;
	tab: MyDealsDetailTabId;
};

export type AllActivityListRouteRef = {
	kind: 'all-activity-list';
	view: AllActivityView;
};

export type AllActivityDetailRouteRef = {
	kind: 'all-activity-detail';
	dealId: DashboardDealRouteParam;
	view: AllActivityView;
};

export type OpportunitiesListRouteRef = {
	kind: 'opportunities-list';
};

export type OpportunitiesDetailRouteRef = {
	kind: 'opportunities-detail';
	insightId: DashboardInsightRouteParam;
};

export type SinceLastMeetingRouteRef = {
	kind: 'since-last-meeting';
};

export type DashboardNavRouteRef =
	| MyDealsListRouteRef
	| AllActivityListRouteRef
	| OpportunitiesListRouteRef
	| SinceLastMeetingRouteRef;

export type DashboardRouteRef =
	| DashboardNavRouteRef
	| MyDealsDetailRouteRef
	| AllActivityDetailRouteRef
	| OpportunitiesDetailRouteRef;

export type InternalLink<TRoute extends DashboardRouteRef = DashboardRouteRef> = {
	kind: 'internal';
	route: TRoute;
};

export type ExternalLink = {
	kind: 'external';
	href: AbsoluteUrl;
	target?: string;
	rel?: string;
};

export type Navigation<TRoute extends DashboardRouteRef> =
	| InternalLink<TRoute>
	| {
			kind: 'none';
	  };

export type LinkTarget<TRoute extends DashboardRouteRef = DashboardRouteRef> =
	| InternalLink<TRoute>
	| ExternalLink;

type NonDefaultMyDealsDetailTabId = Exclude<
	MyDealsDetailTabId,
	typeof DEFAULT_MY_DEALS_DETAIL_TAB_ID
>;

type DashboardPathname =
	| '/my-deals'
	| `/my-deals/${NonDefaultMyDealsView}`
	| `/my-deals/detail/${DashboardDealRouteParam}`
	| `/my-deals/detail/${DashboardDealRouteParam}?tab=${NonDefaultMyDealsDetailTabId}`
	| `/my-deals/${NonDefaultMyDealsView}/detail/${DashboardDealRouteParam}`
	| `/my-deals/${NonDefaultMyDealsView}/detail/${DashboardDealRouteParam}?tab=${NonDefaultMyDealsDetailTabId}`
	| '/all-activity'
	| `/all-activity/${NonDefaultAllActivityView}`
	| `/all-activity/detail/${DashboardDealRouteParam}`
	| `/all-activity/${NonDefaultAllActivityView}/detail/${DashboardDealRouteParam}`
	| '/opportunities'
	| `/opportunities/detail/${DashboardInsightRouteParam}`
	| '/since-last-meeting';

type DashboardLayoutRouteParams = {
	view?: string;
	detailId?: string;
};

type DashboardLayoutRouteParseInput = {
	routeId: string;
	params: DashboardLayoutRouteParams;
	searchParams: URLSearchParams;
};

type DashboardRouteDefinition<TRoute extends DashboardRouteRef> = {
	routeIds: readonly string[];
	parse: (input: DashboardLayoutRouteParseInput) => TRoute | null;
	href: (route: TRoute) => string;
};

type DashboardRouteDefinitionMap = {
	[K in DashboardRouteRef['kind']]: DashboardRouteDefinition<Extract<DashboardRouteRef, { kind: K }>>;
};

export const DEFAULT_DASHBOARD_ROUTE_REF: AllActivityListRouteRef = {
	kind: 'all-activity-list',
	view: DEFAULT_ALL_ACTIVITY_VIEW
};

function hasOnlyAllowedSearchParams(
	searchParams: URLSearchParams,
	allowedKeys: readonly string[]
) {
	const allowedKeySet = new Set(allowedKeys);

	return [...searchParams.keys()].every((key) => allowedKeySet.has(key));
}

function resolveMyDealsDetailTab(searchParams: URLSearchParams): MyDealsDetailTabId | null {
	if (!hasOnlyAllowedSearchParams(searchParams, ['tab'])) {
		return null;
	}

	const tab = searchParams.get('tab');

	if (tab === null) {
		return DEFAULT_MY_DEALS_DETAIL_TAB_ID;
	}

	return isMyDealsDetailTabId(tab) ? tab : null;
}

function resolveMyDealsListPath(view: MyDealsView) {
	if (view === DEFAULT_MY_DEALS_VIEW) {
		return MY_DEALS_BASE_PATH;
	}

	return `${MY_DEALS_BASE_PATH}/${view}`;
}

function resolveAllActivityListPath(view: AllActivityView) {
	if (view === DEFAULT_ALL_ACTIVITY_VIEW) {
		return ALL_ACTIVITY_BASE_PATH;
	}

	return `${ALL_ACTIVITY_BASE_PATH}/${view}`;
}

function resolveDetailIdParam(value: string | undefined) {
	return value && value.length > 0 ? value : null;
}

const dashboardRouteDefinitions = {
	'my-deals-list': {
		routeIds: DASHBOARD_ROUTE_IDS.myDealsList,
		parse: ({ routeId, params, searchParams }) => {
			if (searchParams.size > 0) {
				return null;
			}

			if (routeId === DASHBOARD_ROUTE_IDS.myDealsList[0]) {
				return {
					kind: 'my-deals-list',
					view: DEFAULT_MY_DEALS_VIEW
				};
			}

			if (!params.view || !isNonDefaultMyDealsView(params.view)) {
				return null;
			}

			return {
				kind: 'my-deals-list',
				view: params.view
			};
		},
		href: (route) => resolveMyDealsListPath(route.view)
	},
	'my-deals-detail': {
		routeIds: DASHBOARD_ROUTE_IDS.myDealsDetail,
		parse: ({ routeId, params, searchParams }) => {
			const detailId = resolveDetailIdParam(params.detailId);

			if (!detailId) {
				return null;
			}

			const tab = resolveMyDealsDetailTab(searchParams);

			if (!tab) {
				return null;
			}

			if (routeId === DASHBOARD_ROUTE_IDS.myDealsDetail[0]) {
				return {
					kind: 'my-deals-detail',
					dealId: detailId,
					view: DEFAULT_MY_DEALS_VIEW,
					tab
				};
			}

			if (!params.view || !isNonDefaultMyDealsView(params.view)) {
				return null;
			}

			return {
				kind: 'my-deals-detail',
				dealId: detailId,
				view: params.view,
				tab
			};
		},
		href: (route) => {
			if (route.view === DEFAULT_MY_DEALS_VIEW) {
				if (route.tab === DEFAULT_MY_DEALS_DETAIL_TAB_ID) {
					return `/my-deals/detail/${route.dealId}`;
				}

				return `/my-deals/detail/${route.dealId}?tab=${route.tab}`;
			}

			if (route.tab === DEFAULT_MY_DEALS_DETAIL_TAB_ID) {
				return `/my-deals/${route.view}/detail/${route.dealId}`;
			}

			return `/my-deals/${route.view}/detail/${route.dealId}?tab=${route.tab}`;
		}
	},
	'all-activity-list': {
		routeIds: DASHBOARD_ROUTE_IDS.allActivityList,
		parse: ({ routeId, params, searchParams }) => {
			if (searchParams.size > 0) {
				return null;
			}

			if (routeId === DASHBOARD_ROUTE_IDS.allActivityList[0]) {
				return {
					kind: 'all-activity-list',
					view: DEFAULT_ALL_ACTIVITY_VIEW
				};
			}

			if (!params.view || !isNonDefaultAllActivityView(params.view)) {
				return null;
			}

			return {
				kind: 'all-activity-list',
				view: params.view
			};
		},
		href: (route) => resolveAllActivityListPath(route.view)
	},
	'all-activity-detail': {
		routeIds: DASHBOARD_ROUTE_IDS.allActivityDetail,
		parse: ({ routeId, params, searchParams }) => {
			if (searchParams.size > 0) {
				return null;
			}

			const detailId = resolveDetailIdParam(params.detailId);

			if (!detailId) {
				return null;
			}

			if (routeId === DASHBOARD_ROUTE_IDS.allActivityDetail[0]) {
				return {
					kind: 'all-activity-detail',
					dealId: detailId,
					view: DEFAULT_ALL_ACTIVITY_VIEW
				};
			}

			if (!params.view || !isNonDefaultAllActivityView(params.view)) {
				return null;
			}

			return {
				kind: 'all-activity-detail',
				dealId: detailId,
				view: params.view
			};
		},
		href: (route) => `${resolveAllActivityListPath(route.view)}/detail/${route.dealId}`
	},
	'opportunities-list': {
		routeIds: [DASHBOARD_ROUTE_IDS.opportunities[0]],
		parse: ({ searchParams }) => {
			if (searchParams.size > 0) {
				return null;
			}

			return {
				kind: 'opportunities-list'
			};
		},
		href: () => OPPORTUNITIES_BASE_PATH
	},
	'opportunities-detail': {
		routeIds: [DASHBOARD_ROUTE_IDS.opportunities[1]],
		parse: ({ params, searchParams }) => {
			if (searchParams.size > 0) {
				return null;
			}

			const detailId = resolveDetailIdParam(params.detailId);

			if (!detailId) {
				return null;
			}

			return {
				kind: 'opportunities-detail',
				insightId: detailId
			};
		},
		href: (route) => `${OPPORTUNITIES_BASE_PATH}/detail/${route.insightId}`
	},
	'since-last-meeting': {
		routeIds: DASHBOARD_ROUTE_IDS.sinceLastMeeting,
		parse: ({ searchParams }) => {
			if (searchParams.size > 0) {
				return null;
			}

			return {
				kind: 'since-last-meeting'
			};
		},
		href: () => SINCE_LAST_MEETING_PATH
	}
} satisfies DashboardRouteDefinitionMap;

const dashboardRouteDefinitionEntries = Object.values(
	dashboardRouteDefinitions
) as DashboardRouteDefinition<DashboardRouteRef>[];

export function resolveDashboardRoute(route: DashboardRouteRef): DashboardPathname {
	return (dashboardRouteDefinitions[route.kind] as DashboardRouteDefinition<DashboardRouteRef>).href(
		route
	) as DashboardPathname;
}

export function parseDashboardRouteFromLayout(input: {
	routeId: string | null;
	params: DashboardLayoutRouteParams;
	searchParams: URLSearchParams;
}): DashboardRouteRef | null {
	if (!input.routeId) {
		return null;
	}

	const definition = dashboardRouteDefinitionEntries.find((entry) =>
		entry.routeIds.includes(input.routeId as never)
	);

	if (!definition) {
		return null;
	}

	return definition.parse({
		routeId: input.routeId,
		params: input.params,
		searchParams: input.searchParams
	});
}

export function isDashboardNavRouteActive(
	itemRoute: DashboardNavRouteRef,
	currentRoute: DashboardRouteRef
) {
	switch (itemRoute.kind) {
		case 'my-deals-list':
			return currentRoute.kind === 'my-deals-list' || currentRoute.kind === 'my-deals-detail';
		case 'all-activity-list':
			return (
				currentRoute.kind === 'all-activity-list' || currentRoute.kind === 'all-activity-detail'
			);
		case 'opportunities-list':
			return (
				currentRoute.kind === 'opportunities-list' ||
				currentRoute.kind === 'opportunities-detail'
			);
		case 'since-last-meeting':
			return currentRoute.kind === 'since-last-meeting';
	}
}
