import { DASHBOARD_STATIC_ROUTES } from '$lib/dashboard/routes';

const MY_DEALS_BASE_PATH = DASHBOARD_STATIC_ROUTES['my-deals'];

export const DEFAULT_MY_DEALS_VIEW = 'news' as const;
export const MY_DEALS_NON_DEFAULT_VIEWS = ['deals'] as const;

export type NonDefaultMyDealsView = (typeof MY_DEALS_NON_DEFAULT_VIEWS)[number];
export type MyDealsView = typeof DEFAULT_MY_DEALS_VIEW | NonDefaultMyDealsView;

export const MY_DEALS_VIEW_OPTIONS = [
	{ id: DEFAULT_MY_DEALS_VIEW, label: "This week's news" },
	{ id: 'deals', label: 'Deals' }
] as const;

export type MyDealsListHref =
	| typeof MY_DEALS_BASE_PATH
	| `${typeof MY_DEALS_BASE_PATH}/${NonDefaultMyDealsView}`;

export type MyDealsDetailHref =
	| `${typeof MY_DEALS_BASE_PATH}/detail/${string}`
	| `${typeof MY_DEALS_BASE_PATH}/${NonDefaultMyDealsView}/detail/${string}`;

const MY_DEALS_LIST_PATHS = new Set<MyDealsListHref>([
	buildMyDealsListHref(DEFAULT_MY_DEALS_VIEW),
	...MY_DEALS_NON_DEFAULT_VIEWS.map((view) => buildMyDealsListHref(view))
]);

const MY_DEALS_DETAIL_PATH_PREFIXES = [
	`${buildMyDealsListHref(DEFAULT_MY_DEALS_VIEW)}/detail/`,
	...MY_DEALS_NON_DEFAULT_VIEWS.map((view) => `${buildMyDealsListHref(view)}/detail/`)
] as const;

export function isNonDefaultMyDealsView(value: string): value is NonDefaultMyDealsView {
	return MY_DEALS_NON_DEFAULT_VIEWS.includes(value as NonDefaultMyDealsView);
}

export function getMyDealsViewLabel(view: MyDealsView) {
	return (
		MY_DEALS_VIEW_OPTIONS.find((option) => option.id === view)?.label ?? MY_DEALS_VIEW_OPTIONS[0].label
	);
}

export function getMyDealsListLabel(pathname: string) {
	const normalizedPathname =
		pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

	if (!isMyDealsListPath(normalizedPathname)) {
		return null;
	}

	const selectedView =
		normalizedPathname === MY_DEALS_BASE_PATH
			? DEFAULT_MY_DEALS_VIEW
			: (normalizedPathname.slice(MY_DEALS_BASE_PATH.length + 1) as NonDefaultMyDealsView);

	return getMyDealsViewLabel(selectedView);
}

export function buildMyDealsListHref(view: MyDealsView): MyDealsListHref {
	if (view === DEFAULT_MY_DEALS_VIEW) {
		return MY_DEALS_BASE_PATH;
	}

	return `${MY_DEALS_BASE_PATH}/${view}`;
}

export function buildMyDealsDetailHref(dealId: string, view: MyDealsView): MyDealsDetailHref {
	if (view === DEFAULT_MY_DEALS_VIEW) {
		return `${MY_DEALS_BASE_PATH}/detail/${dealId}`;
	}

	return `${buildMyDealsListHref(view)}/detail/${dealId}`;
}

export function isMyDealsListPath(pathname: string): pathname is MyDealsListHref {
	return MY_DEALS_LIST_PATHS.has(pathname as MyDealsListHref);
}

export function isMyDealsDetailPath(pathname: string): pathname is MyDealsDetailHref {
	return MY_DEALS_DETAIL_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
