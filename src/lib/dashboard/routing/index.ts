import type { DealId, InsightId } from '$lib/types/ids';
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

export type MyDealsListRouteRef = {
	kind: 'my-deals-list';
	view: MyDealsView;
};

export type MyDealsDetailRouteRef = {
	kind: 'my-deals-detail';
	dealId: DealId;
	view: MyDealsView;
	tab: MyDealsDetailTabId;
};

export type AllActivityListRouteRef = {
	kind: 'all-activity-list';
	view: AllActivityView;
};

export type AllActivityDetailRouteRef = {
	kind: 'all-activity-detail';
	dealId: DealId;
	view: AllActivityView;
};

export type OpportunitiesListRouteRef = {
	kind: 'opportunities-list';
};

export type OpportunitiesDetailRouteRef = {
	kind: 'opportunities-detail';
	insightId: InsightId;
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
	href: string;
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

export type DashboardPathname =
	| '/my-deals'
	| `/my-deals/${NonDefaultMyDealsView}`
	| `/my-deals/detail/${DealId}`
	| `/my-deals/detail/${DealId}?tab=${NonDefaultMyDealsDetailTabId}`
	| `/my-deals/${NonDefaultMyDealsView}/detail/${DealId}`
	| `/my-deals/${NonDefaultMyDealsView}/detail/${DealId}?tab=${NonDefaultMyDealsDetailTabId}`
	| '/all-activity'
	| `/all-activity/${NonDefaultAllActivityView}`
	| `/all-activity/detail/${DealId}`
	| `/all-activity/${NonDefaultAllActivityView}/detail/${DealId}`
	| '/opportunities'
	| `/opportunities/detail/${InsightId}`
	| '/since-last-meeting';

export const DEFAULT_DASHBOARD_ROUTE_REF: AllActivityListRouteRef = {
	kind: 'all-activity-list',
	view: DEFAULT_ALL_ACTIVITY_VIEW
};

function toPathname(pathname: string): DashboardPathname {
	return pathname as DashboardPathname;
}

function normalizePathname(pathname: string) {
	if (!pathname) {
		return '/';
	}

	if (pathname !== '/' && pathname.endsWith('/')) {
		return pathname.slice(0, -1);
	}

	return pathname;
}

function toLocation(input: string | URL) {
	if (input instanceof URL) {
		return {
			pathname: normalizePathname(input.pathname),
			searchParams: input.searchParams
		};
	}

	try {
		const url = new URL(input);

		return {
			pathname: normalizePathname(url.pathname),
			searchParams: url.searchParams
		};
	} catch {
		let pathname = input;
		let search = '';

		const hashIndex = pathname.indexOf('#');

		if (hashIndex >= 0) {
			pathname = pathname.slice(0, hashIndex);
		}

		const searchIndex = pathname.indexOf('?');

		if (searchIndex >= 0) {
			search = pathname.slice(searchIndex + 1);
			pathname = pathname.slice(0, searchIndex);
		}

		return {
			pathname: normalizePathname(pathname),
			searchParams: new URLSearchParams(search)
		};
	}
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

function matchMyDealsRoute(pathname: string, searchParams: URLSearchParams): DashboardRouteRef | null {
	if (pathname === MY_DEALS_BASE_PATH) {
		return {
			kind: 'my-deals-list',
			view: DEFAULT_MY_DEALS_VIEW
		};
	}

	if (!pathname.startsWith(`${MY_DEALS_BASE_PATH}/`)) {
		return null;
	}

	const segments = pathname.slice(MY_DEALS_BASE_PATH.length + 1).split('/');

	if (segments.length === 1 && isNonDefaultMyDealsView(segments[0])) {
		return {
			kind: 'my-deals-list',
			view: segments[0]
		};
	}

	if (segments.length === 2 && segments[0] === 'detail' && segments[1]) {
		return {
			kind: 'my-deals-detail',
			dealId: segments[1] as DealId,
			view: DEFAULT_MY_DEALS_VIEW,
			tab: resolveMyDealsRouteTab(searchParams)
		};
	}

	if (
		segments.length === 3 &&
		isNonDefaultMyDealsView(segments[0]) &&
		segments[1] === 'detail' &&
		segments[2]
	) {
		return {
			kind: 'my-deals-detail',
			dealId: segments[2] as DealId,
			view: segments[0],
			tab: resolveMyDealsRouteTab(searchParams)
		};
	}

	return null;
}

function resolveMyDealsRouteTab(searchParams: URLSearchParams) {
	const tab = searchParams.get('tab');

	return tab && isMyDealsDetailTabId(tab) ? tab : DEFAULT_MY_DEALS_DETAIL_TAB_ID;
}

function matchAllActivityRoute(pathname: string): DashboardRouteRef | null {
	if (pathname === ALL_ACTIVITY_BASE_PATH) {
		return {
			kind: 'all-activity-list',
			view: DEFAULT_ALL_ACTIVITY_VIEW
		};
	}

	if (!pathname.startsWith(`${ALL_ACTIVITY_BASE_PATH}/`)) {
		return null;
	}

	const segments = pathname.slice(ALL_ACTIVITY_BASE_PATH.length + 1).split('/');

	if (segments.length === 1 && isNonDefaultAllActivityView(segments[0])) {
		return {
			kind: 'all-activity-list',
			view: segments[0]
		};
	}

	if (segments.length === 2 && segments[0] === 'detail' && segments[1]) {
		return {
			kind: 'all-activity-detail',
			dealId: segments[1] as DealId,
			view: DEFAULT_ALL_ACTIVITY_VIEW
		};
	}

	if (
		segments.length === 3 &&
		isNonDefaultAllActivityView(segments[0]) &&
		segments[1] === 'detail' &&
		segments[2]
	) {
		return {
			kind: 'all-activity-detail',
			dealId: segments[2] as DealId,
			view: segments[0]
		};
	}

	return null;
}

export function resolveDashboardRoute(route: DashboardRouteRef): DashboardPathname {
	switch (route.kind) {
		case 'my-deals-list':
			return toPathname(resolveMyDealsListPath(route.view));
		case 'my-deals-detail': {
			const pathname = `${resolveMyDealsListPath(route.view)}/detail/${route.dealId}`;

			if (route.tab === DEFAULT_MY_DEALS_DETAIL_TAB_ID) {
				return toPathname(pathname);
			}

			return toPathname(`${pathname}?tab=${route.tab}`);
		}
		case 'all-activity-list':
			return toPathname(resolveAllActivityListPath(route.view));
		case 'all-activity-detail':
			return toPathname(
				`${resolveAllActivityListPath(route.view)}/detail/${route.dealId}`
			);
		case 'opportunities-list':
			return toPathname(OPPORTUNITIES_BASE_PATH);
		case 'opportunities-detail':
			return toPathname(`${OPPORTUNITIES_BASE_PATH}/detail/${route.insightId}`);
		case 'since-last-meeting':
			return toPathname(SINCE_LAST_MEETING_PATH);
	}
}

export function matchDashboardRoute(pathnameOrUrl: string | URL): DashboardRouteRef | null {
	const { pathname, searchParams } = toLocation(pathnameOrUrl);

	return (
		matchMyDealsRoute(pathname, searchParams) ??
		matchAllActivityRoute(pathname) ??
		(pathname === OPPORTUNITIES_BASE_PATH
			? { kind: 'opportunities-list' }
			: pathname.startsWith(`${OPPORTUNITIES_BASE_PATH}/detail/`)
				? (() => {
						const segments = pathname.slice(OPPORTUNITIES_BASE_PATH.length + 1).split('/');

						if (segments.length !== 2 || segments[0] !== 'detail' || !segments[1]) {
							return null;
						}

						return {
							kind: 'opportunities-detail',
							insightId: segments[1] as InsightId
						} satisfies OpportunitiesDetailRouteRef;
					})()
				: pathname === SINCE_LAST_MEETING_PATH
					? { kind: 'since-last-meeting' }
					: null)
	);
}

export function isDashboardNavRouteActive(
	itemRoute: DashboardNavRouteRef,
	currentRoute: DashboardRouteRef | null
) {
	if (!currentRoute) {
		return false;
	}

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
