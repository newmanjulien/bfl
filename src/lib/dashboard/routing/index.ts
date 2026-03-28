import type { AbsoluteUrl } from '$lib/types/url';
import type { DealKey, InsightKey, MeetingKey } from '$lib/types/keys';
import {
	DEFAULT_NEW_BUSINESS_VIEW,
	isNonDefaultNewBusinessView,
	type NewBusinessView,
	type NonDefaultNewBusinessView
} from './new-business';
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
const NEW_BUSINESS_BASE_PATH = '/new-business';
const OPPORTUNITIES_BASE_PATH = '/opportunities';
const SINCE_LAST_MEETING_PATH = '/since-last-meeting';

const DASHBOARD_ROUTE_IDS = {
	myDealsList: ['/(dashboard)/my-deals', '/(dashboard)/my-deals/[view=myDealsView]'],
	myDealsDetail: [
		'/(dashboard)/my-deals/detail/[dealKey]',
		'/(dashboard)/my-deals/[view=myDealsView]/detail/[dealKey]'
	],
	newBusinessList: [
		'/(dashboard)/new-business',
		'/(dashboard)/new-business/[view=newBusinessView]'
	],
	newBusinessDetail: [
		'/(dashboard)/new-business/detail/[dealKey]',
		'/(dashboard)/new-business/[view=newBusinessView]/detail/[dealKey]'
	],
	opportunities: ['/(dashboard)/opportunities', '/(dashboard)/opportunities/detail/[insightKey]'],
	sinceLastMeeting: ['/(dashboard)/since-last-meeting']
} as const;

export type MyDealsListRouteRef = {
	kind: 'my-deals-list';
	view: MyDealsView;
};

export type MyDealsDetailRouteRef = {
	kind: 'my-deals-detail';
	dealKey: DealKey;
	view: MyDealsView;
	tab: MyDealsDetailTabId;
};

export type NewBusinessListRouteRef = {
	kind: 'new-business-list';
	view: NewBusinessView;
};

export type NewBusinessDetailRouteRef = {
	kind: 'new-business-detail';
	dealKey: DealKey;
	view: NewBusinessView;
};

export type OpportunitiesListRouteRef = {
	kind: 'opportunities-list';
	meetingKey: MeetingKey | null;
};

export type OpportunitiesDetailRouteRef = {
	kind: 'opportunities-detail';
	insightKey: InsightKey;
	meetingKey: MeetingKey | null;
};

export type SinceLastMeetingRouteRef = {
	kind: 'since-last-meeting';
	meetingKey: MeetingKey | null;
};

export type DashboardNavRouteRef =
	| MyDealsListRouteRef
	| NewBusinessListRouteRef
	| OpportunitiesListRouteRef
	| SinceLastMeetingRouteRef;

export type DashboardRouteRef =
	| DashboardNavRouteRef
	| MyDealsDetailRouteRef
	| NewBusinessDetailRouteRef
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
	| `/my-deals/detail/${DealKey}`
	| `/my-deals/detail/${DealKey}?tab=${NonDefaultMyDealsDetailTabId}`
	| `/my-deals/${NonDefaultMyDealsView}/detail/${DealKey}`
	| `/my-deals/${NonDefaultMyDealsView}/detail/${DealKey}?tab=${NonDefaultMyDealsDetailTabId}`
	| '/new-business'
	| `/new-business/${NonDefaultNewBusinessView}`
	| `/new-business/detail/${DealKey}`
	| `/new-business/${NonDefaultNewBusinessView}/detail/${DealKey}`
	| '/opportunities'
	| `/opportunities?meetingKey=${MeetingKey}`
	| `/opportunities/detail/${InsightKey}`
	| `/opportunities/detail/${InsightKey}?meetingKey=${MeetingKey}`
	| '/since-last-meeting'
	| `/since-last-meeting?meetingKey=${MeetingKey}`;

type DashboardLayoutRouteParams = {
	view?: string;
	dealKey?: string;
	insightKey?: string;
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

export const DEFAULT_DASHBOARD_ROUTE_REF: NewBusinessListRouteRef = {
	kind: 'new-business-list',
	view: DEFAULT_NEW_BUSINESS_VIEW
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

function resolveNewBusinessListPath(view: NewBusinessView) {
	if (view === DEFAULT_NEW_BUSINESS_VIEW) {
		return NEW_BUSINESS_BASE_PATH;
	}

	return `${NEW_BUSINESS_BASE_PATH}/${view}`;
}

function resolveRequiredRouteParam(value: string | undefined) {
	return value && value.length > 0 ? value : null;
}

function resolveOptionalMeetingKey(searchParams: URLSearchParams) {
	const meetingKey = searchParams.get('meetingKey');

	return meetingKey && meetingKey.length > 0 ? (meetingKey as MeetingKey) : null;
}

function withOptionalMeetingKey(path: string, meetingKey: MeetingKey | null) {
	return meetingKey ? `${path}?meetingKey=${meetingKey}` : path;
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
			const dealKey = resolveRequiredRouteParam(params.dealKey);

			if (!dealKey) {
				return null;
			}

			const tab = resolveMyDealsDetailTab(searchParams);

			if (!tab) {
				return null;
			}

			if (routeId === DASHBOARD_ROUTE_IDS.myDealsDetail[0]) {
				return {
					kind: 'my-deals-detail',
					dealKey: dealKey as DealKey,
					view: DEFAULT_MY_DEALS_VIEW,
					tab
				};
			}

			if (!params.view || !isNonDefaultMyDealsView(params.view)) {
				return null;
			}

			return {
				kind: 'my-deals-detail',
				dealKey: dealKey as DealKey,
				view: params.view,
				tab
			};
		},
		href: (route) => {
			if (route.view === DEFAULT_MY_DEALS_VIEW) {
				if (route.tab === DEFAULT_MY_DEALS_DETAIL_TAB_ID) {
					return `/my-deals/detail/${route.dealKey}`;
				}

				return `/my-deals/detail/${route.dealKey}?tab=${route.tab}`;
			}

			if (route.tab === DEFAULT_MY_DEALS_DETAIL_TAB_ID) {
				return `/my-deals/${route.view}/detail/${route.dealKey}`;
			}

			return `/my-deals/${route.view}/detail/${route.dealKey}?tab=${route.tab}`;
		}
	},
	'new-business-list': {
		routeIds: DASHBOARD_ROUTE_IDS.newBusinessList,
		parse: ({ routeId, params, searchParams }) => {
			if (searchParams.size > 0) {
				return null;
			}

			if (routeId === DASHBOARD_ROUTE_IDS.newBusinessList[0]) {
				return {
					kind: 'new-business-list',
					view: DEFAULT_NEW_BUSINESS_VIEW
				};
			}

			if (!params.view || !isNonDefaultNewBusinessView(params.view)) {
				return null;
			}

			return {
				kind: 'new-business-list',
				view: params.view
			};
		},
		href: (route) => resolveNewBusinessListPath(route.view)
	},
	'new-business-detail': {
		routeIds: DASHBOARD_ROUTE_IDS.newBusinessDetail,
		parse: ({ routeId, params, searchParams }) => {
			if (searchParams.size > 0) {
				return null;
			}

			const dealKey = resolveRequiredRouteParam(params.dealKey);

			if (!dealKey) {
				return null;
			}

			if (routeId === DASHBOARD_ROUTE_IDS.newBusinessDetail[0]) {
				return {
					kind: 'new-business-detail',
					dealKey: dealKey as DealKey,
					view: DEFAULT_NEW_BUSINESS_VIEW
				};
			}

			if (!params.view || !isNonDefaultNewBusinessView(params.view)) {
				return null;
			}

			return {
				kind: 'new-business-detail',
				dealKey: dealKey as DealKey,
				view: params.view
			};
		},
		href: (route) => `${resolveNewBusinessListPath(route.view)}/detail/${route.dealKey}`
	},
	'opportunities-list': {
		routeIds: [DASHBOARD_ROUTE_IDS.opportunities[0]],
		parse: ({ searchParams }) => {
			if (!hasOnlyAllowedSearchParams(searchParams, ['meetingKey'])) {
				return null;
			}

			return {
				kind: 'opportunities-list',
				meetingKey: resolveOptionalMeetingKey(searchParams)
			};
		},
		href: (route) => withOptionalMeetingKey(OPPORTUNITIES_BASE_PATH, route.meetingKey)
	},
	'opportunities-detail': {
		routeIds: [DASHBOARD_ROUTE_IDS.opportunities[1]],
		parse: ({ params, searchParams }) => {
			if (!hasOnlyAllowedSearchParams(searchParams, ['meetingKey'])) {
				return null;
			}

			const insightKey = resolveRequiredRouteParam(params.insightKey);

			if (!insightKey) {
				return null;
			}

			return {
				kind: 'opportunities-detail',
				insightKey: insightKey as InsightKey,
				meetingKey: resolveOptionalMeetingKey(searchParams)
			};
		},
		href: (route) =>
			withOptionalMeetingKey(
				`${OPPORTUNITIES_BASE_PATH}/detail/${route.insightKey}`,
				route.meetingKey
			)
	},
	'since-last-meeting': {
		routeIds: DASHBOARD_ROUTE_IDS.sinceLastMeeting,
		parse: ({ searchParams }) => {
			if (!hasOnlyAllowedSearchParams(searchParams, ['meetingKey'])) {
				return null;
			}

			return {
				kind: 'since-last-meeting',
				meetingKey: resolveOptionalMeetingKey(searchParams)
			};
		},
		href: (route) => withOptionalMeetingKey(SINCE_LAST_MEETING_PATH, route.meetingKey)
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
		case 'new-business-list':
			return (
				currentRoute.kind === 'new-business-list' || currentRoute.kind === 'new-business-detail'
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
