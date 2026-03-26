import { DASHBOARD_STATIC_ROUTES } from '$lib/dashboard/routes';

const ALL_ACTIVITY_BASE_PATH = DASHBOARD_STATIC_ROUTES['all-activity'];

export const DEFAULT_ALL_ACTIVITY_VIEW = 'deals' as const;
export const ALL_ACTIVITY_NON_DEFAULT_VIEWS = [
	'need-support',
	'duplicated-work',
	'unassigned',
	'likely-out-of-date'
] as const;

export type NonDefaultAllActivityView = (typeof ALL_ACTIVITY_NON_DEFAULT_VIEWS)[number];
export type AllActivityView = typeof DEFAULT_ALL_ACTIVITY_VIEW | NonDefaultAllActivityView;

export const ALL_ACTIVITY_VIEW_OPTIONS = [
	{ id: DEFAULT_ALL_ACTIVITY_VIEW, label: 'Deals' },
	{ id: 'need-support', label: 'Need support' },
	{ id: 'duplicated-work', label: 'Duplicated work' },
	{ id: 'unassigned', label: 'Unassigned' },
	{ id: 'likely-out-of-date', label: 'Likely out of date' }
] as const;

export type AllActivityListHref =
	| typeof ALL_ACTIVITY_BASE_PATH
	| `${typeof ALL_ACTIVITY_BASE_PATH}/${NonDefaultAllActivityView}`;

export type AllActivityDetailHref =
	| `${typeof ALL_ACTIVITY_BASE_PATH}/detail/${string}`
	| `${typeof ALL_ACTIVITY_BASE_PATH}/${NonDefaultAllActivityView}/detail/${string}`;

const ALL_ACTIVITY_LIST_PATHS = new Set<AllActivityListHref>([
	buildAllActivityListHref(DEFAULT_ALL_ACTIVITY_VIEW),
	...ALL_ACTIVITY_NON_DEFAULT_VIEWS.map((view) => buildAllActivityListHref(view))
]);

const ALL_ACTIVITY_DETAIL_PATH_PREFIXES = [
	`${buildAllActivityListHref(DEFAULT_ALL_ACTIVITY_VIEW)}/detail/`,
	...ALL_ACTIVITY_NON_DEFAULT_VIEWS.map((view) => `${buildAllActivityListHref(view)}/detail/`)
] as const;

export function isNonDefaultAllActivityView(value: string): value is NonDefaultAllActivityView {
	return ALL_ACTIVITY_NON_DEFAULT_VIEWS.includes(value as NonDefaultAllActivityView);
}

export function getAllActivityViewLabel(view: AllActivityView) {
	return (
		ALL_ACTIVITY_VIEW_OPTIONS.find((option) => option.id === view)?.label ??
		ALL_ACTIVITY_VIEW_OPTIONS[0].label
	);
}

export function getAllActivityListLabel(pathname: string) {
	const normalizedPathname =
		pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

	if (!isAllActivityListPath(normalizedPathname)) {
		return null;
	}

	const selectedView =
		normalizedPathname === ALL_ACTIVITY_BASE_PATH
			? DEFAULT_ALL_ACTIVITY_VIEW
			: (normalizedPathname.slice(ALL_ACTIVITY_BASE_PATH.length + 1) as NonDefaultAllActivityView);

	return getAllActivityViewLabel(selectedView);
}

export function buildAllActivityListHref(view: AllActivityView): AllActivityListHref {
	if (view === DEFAULT_ALL_ACTIVITY_VIEW) {
		return ALL_ACTIVITY_BASE_PATH;
	}

	return `${ALL_ACTIVITY_BASE_PATH}/${view}`;
}

export function buildAllActivityDetailHref(
	dealId: string,
	view: AllActivityView
): AllActivityDetailHref {
	if (view === DEFAULT_ALL_ACTIVITY_VIEW) {
		return `${ALL_ACTIVITY_BASE_PATH}/detail/${dealId}`;
	}

	return `${buildAllActivityListHref(view)}/detail/${dealId}`;
}

export function isAllActivityListPath(pathname: string): pathname is AllActivityListHref {
	return ALL_ACTIVITY_LIST_PATHS.has(pathname as AllActivityListHref);
}

export function isAllActivityDetailPath(pathname: string): pathname is AllActivityDetailHref {
	return ALL_ACTIVITY_DETAIL_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
