export const DASHBOARD_STATIC_ROUTES = {
	'my-deals': '/my-deals',
	'since-last-meeting': '/since-last-meeting',
	forecast: '/forecast',
	opportunities: '/opportunities',
	'all-activity': '/all-activity'
} as const;

export type DashboardStaticHref =
	(typeof DASHBOARD_STATIC_ROUTES)[keyof typeof DASHBOARD_STATIC_ROUTES];

export const DASHBOARD_BACK_HREFS = {
	allActivity: DASHBOARD_STATIC_ROUTES['all-activity'],
	myDeals: DASHBOARD_STATIC_ROUTES['my-deals'],
	opportunities: DASHBOARD_STATIC_ROUTES.opportunities
} as const;

export type DashboardBackHref =
	(typeof DASHBOARD_BACK_HREFS)[keyof typeof DASHBOARD_BACK_HREFS];

export const DEFAULT_DASHBOARD_ROUTE = DASHBOARD_STATIC_ROUTES['since-last-meeting'];

function normalizePathname(pathname: string) {
	if (!pathname) return '/';
	if (pathname !== '/' && pathname.endsWith('/')) return pathname.slice(0, -1);
	return pathname;
}

export function isPathWithinRoute(pathname: string, route: DashboardStaticHref) {
	const normalizedPathname = normalizePathname(pathname);
	const normalizedRoute = normalizePathname(route);

	return (
		normalizedPathname === normalizedRoute ||
		normalizedPathname.startsWith(`${normalizedRoute}/`)
	);
}

export function getActiveDashboardRoute(pathname: string) {
	for (const route of Object.values(DASHBOARD_STATIC_ROUTES)) {
		if (isPathWithinRoute(pathname, route)) {
			return route;
		}
	}

	return null;
}
