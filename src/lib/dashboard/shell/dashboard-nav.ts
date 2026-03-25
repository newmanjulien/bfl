import { Activity, CircleQuestionMark, LayoutGrid, Lightbulb, List, Rss } from 'lucide-svelte';
import { DASHBOARD_STATIC_ROUTES, type DashboardStaticHref } from '$lib/dashboard/routes';

type DashboardNavIcon = typeof Rss;

export type DashboardNavSectionId = 'brokers' | 'managers' | 'leadership' | 'bottom';

type DashboardNavItemBase = {
	label: string;
	icon: DashboardNavIcon;
};

export type DashboardNavRouteItem = DashboardNavItemBase & {
	kind: 'route';
	href: DashboardStaticHref;
	matches(pathname: string): boolean;
};

export type DashboardNavDisabledItem = DashboardNavItemBase & {
	kind: 'disabled';
};

export type DashboardNavItem = DashboardNavRouteItem | DashboardNavDisabledItem;

export type DashboardNavSection = {
	id: DashboardNavSectionId;
	heading: string | null;
	desktopSectionClass?: string;
	mobileSectionClass?: string;
	showCollapsedDivider?: boolean;
	items: readonly DashboardNavItem[];
};

function normalizePathname(pathname: string) {
	if (!pathname) return '/';
	if (pathname !== '/' && pathname.endsWith('/')) return pathname.slice(0, -1);
	return pathname;
}

function createRouteItem(params: {
	href: DashboardStaticHref;
	label: string;
	icon: DashboardNavIcon;
}): DashboardNavRouteItem {
	const { href, label, icon } = params;

	return {
		kind: 'route',
		href,
		label,
		icon,
		matches(pathname: string) {
			const normalizedPathname = normalizePathname(pathname);
			const normalizedRoute = normalizePathname(href);

			return (
				normalizedPathname === normalizedRoute ||
				normalizedPathname.startsWith(`${normalizedRoute}/`)
			);
		}
	};
}

export const DASHBOARD_NAV_SECTIONS: readonly DashboardNavSection[] = [
	{
		id: 'brokers',
		heading: 'For brokers',
		desktopSectionClass: 'pt-2',
		items: [
			createRouteItem({
				href: DASHBOARD_STATIC_ROUTES['my-deals'],
				label: 'My deals',
				icon: Rss
			})
		]
	},
	{
		id: 'managers',
		heading: 'For managers',
		desktopSectionClass: 'pt-6',
		mobileSectionClass: 'pt-4',
		showCollapsedDivider: true,
		items: [
			createRouteItem({
				href: DASHBOARD_STATIC_ROUTES['since-last-meeting'],
				label: 'Since last meeting',
				icon: Activity
			}),
			createRouteItem({
				href: DASHBOARD_STATIC_ROUTES.forecast,
				label: 'Forecast',
				icon: LayoutGrid
			}),
			createRouteItem({
				href: DASHBOARD_STATIC_ROUTES.opportunities,
				label: 'Opportunities and risks',
				icon: Lightbulb
			})
		]
	},
	{
		id: 'leadership',
		heading: 'For leadership',
		desktopSectionClass: 'pt-6',
		mobileSectionClass: 'pt-4',
		showCollapsedDivider: true,
		items: [
			createRouteItem({
				href: DASHBOARD_STATIC_ROUTES['all-activity'],
				label: 'All activity',
				icon: List
			})
		]
	},
	{
		id: 'bottom',
		heading: null,
		desktopSectionClass: 'pt-3',
		mobileSectionClass: 'pt-6',
		items: [
			{
				kind: 'disabled',
				label: 'Contact support',
				icon: CircleQuestionMark
			}
		]
	}
];

export function getActiveDashboardNavHref(pathname: string) {
	for (const section of DASHBOARD_NAV_SECTIONS) {
		for (const item of section.items) {
			if (item.kind === 'route' && item.matches(pathname)) {
				return item.href;
			}
		}
	}

	return null;
}
