export const DASHBOARD_STATIC_ROUTES = {
	'my-deals': '/my-deals',
	'since-last-meeting': '/since-last-meeting',
	opportunities: '/opportunities',
	'all-activity': '/all-activity'
} as const;

export type DashboardStaticHref =
	(typeof DASHBOARD_STATIC_ROUTES)[keyof typeof DASHBOARD_STATIC_ROUTES];

export const DEFAULT_DASHBOARD_ROUTE = DASHBOARD_STATIC_ROUTES['since-last-meeting'];
