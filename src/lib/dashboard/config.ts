import { DASHBOARD_STATIC_ROUTES } from '$lib/dashboard/routes';
import type { DashboardNavGroups } from '$lib/dashboard/types';

export const DASHBOARD_NAV_GROUP_ORDER = [
	'brokers',
	'managers',
	'leadership',
	'bottom'
] as const;

export const DASHBOARD_NAV_GROUPS: DashboardNavGroups = {
	brokers: [
		{
			kind: 'route',
			href: DASHBOARD_STATIC_ROUTES['my-deals'],
			label: 'My deals',
			icon: 'rss'
		}
	],
	managers: [
		{
			kind: 'route',
			href: DASHBOARD_STATIC_ROUTES['since-last-meeting'],
			label: 'Since last meeting',
			icon: 'activity'
		},
		{
			kind: 'route',
			href: DASHBOARD_STATIC_ROUTES.forecast,
			label: 'Forecast',
			icon: 'layout-grid'
		},
		{
			kind: 'route',
			href: DASHBOARD_STATIC_ROUTES.opportunities,
			label: 'Opportunities and risks',
			icon: 'lightbulb'
		}
	],
	leadership: [
		{
			kind: 'route',
			href: DASHBOARD_STATIC_ROUTES['all-activity'],
			label: 'All activity',
			icon: 'list'
		}
	],
	bottom: [
		{
			kind: 'disabled',
			label: 'Contact support',
			icon: 'circle-question-mark'
		}
	]
};
