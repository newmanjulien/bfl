import type { DashboardBackHref, DashboardStaticHref } from '$lib/dashboard/routes';

export type DashboardHeaderControl =
	| 'meeting-date'
	| {
			kind: 'back-link';
			href: DashboardBackHref;
			label: string;
	  };

export type DashboardHeaderAction = 'share' | 'broker-switch';

export type DashboardHeaderExtra = 'none' | 'add-deal' | 'all-activity-filters';

export type DashboardHeader = {
	mode: 'context' | 'title';
	title: string;
	control?: DashboardHeaderControl;
	actions?: readonly DashboardHeaderAction[];
	extra?: DashboardHeaderExtra;
	showOverflowButton?: boolean;
};

export type DashboardNavGroupId = 'brokers' | 'managers' | 'leadership' | 'bottom';

type DashboardNavItemBase = {
	label: string;
	icon: 'rss' | 'activity' | 'layout-grid' | 'lightbulb' | 'list' | 'circle-question-mark';
};

export type DashboardRouteNavItem = DashboardNavItemBase & {
	kind: 'route';
	href: DashboardStaticHref;
};

export type DashboardDisabledNavItem = DashboardNavItemBase & {
	kind: 'disabled';
};

export type DashboardNavItem = DashboardRouteNavItem | DashboardDisabledNavItem;

export type DashboardNavGroups = Record<DashboardNavGroupId, DashboardNavItem[]>;
