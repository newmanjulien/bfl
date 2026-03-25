import type { DashboardNavGroupId } from '$lib/dashboard/types';

type DashboardNavGroupPresentation = {
	heading: string | null;
	desktopSectionClassName?: string;
	mobileSectionClassName?: string;
	showCollapsedDivider?: boolean;
};

export const DASHBOARD_NAV_PRESENTATION: Record<
	DashboardNavGroupId,
	DashboardNavGroupPresentation
> = {
	brokers: {
		heading: 'For brokers',
		desktopSectionClassName: 'pt-2'
	},
	managers: {
		heading: 'For managers',
		desktopSectionClassName: 'pt-6',
		mobileSectionClassName: 'pt-4',
		showCollapsedDivider: true
	},
	leadership: {
		heading: 'For leadership',
		desktopSectionClassName: 'pt-6',
		mobileSectionClassName: 'pt-4',
		showCollapsedDivider: true
	},
	bottom: {
		heading: null,
		desktopSectionClassName: 'pt-3',
		mobileSectionClassName: 'pt-6'
	}
};
