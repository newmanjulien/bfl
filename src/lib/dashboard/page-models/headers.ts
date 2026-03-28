import type {
	AllActivityListRouteRef,
	MyDealsListRouteRef,
	OpportunitiesListRouteRef,
	SinceLastMeetingRouteRef
} from '$lib/dashboard/routing';
import type { DashboardHeader } from '$lib/dashboard/shell/header/types';
import {
	ALL_ACTIVITY_VIEW_OPTIONS,
	getAllActivityViewLabel,
	type AllActivityView
} from '$lib/dashboard/routing/all-activity';
import {
	MY_DEALS_VIEW_OPTIONS,
	getMyDealsViewLabel,
	type MyDealsView
} from '$lib/dashboard/routing/my-deals';

type HeaderMenuOption<TId extends string> = {
	id: TId;
	label: string;
};

function buildHeaderTitleMenu<TId extends string>(params: {
	menuId: string;
	ariaLabel: string;
	sectionLabel: string;
	activeLabel: string;
	selectedId: TId;
	options: readonly HeaderMenuOption<TId>[];
	buildRoute: (id: TId) => MyDealsListRouteRef | AllActivityListRouteRef;
}) {
	const { menuId, ariaLabel, sectionLabel, activeLabel, selectedId, options, buildRoute } = params;

	return {
		kind: 'link-menu' as const,
		menuId,
		ariaLabel,
		sectionLabel,
		activeLabel,
		options: options.map((option) => ({
			id: option.id,
			label: option.label,
			route: buildRoute(option.id),
			current: option.id === selectedId
		}))
	};
}

export function createSinceLastMeetingHeader(route: SinceLastMeetingRouteRef): DashboardHeader {
	return {
		leading: {
			kind: 'control-title',
			title: 'Since last meeting',
			control: { kind: 'meeting-date', route }
		},
		actions: ['share', 'broker-switch']
	};
}

export function createSinceLastMeetingDetailHeader(
	title: string,
	backRoute: SinceLastMeetingRouteRef
): DashboardHeader {
	return {
		leading: {
			kind: 'control-title',
			title,
			control: {
				kind: 'back-link',
				route: backRoute,
				label: 'Since last meeting'
			}
		},
		actions: ['share', 'broker-switch']
	};
}

export function createOpportunitiesListHeader(route: OpportunitiesListRouteRef): DashboardHeader {
	return {
		leading: {
			kind: 'control-title',
			title: 'Opportunities & risks',
			control: { kind: 'meeting-date', route }
		},
		actions: ['share', 'broker-switch']
	};
}

export function createOpportunitiesDetailHeader(
	title: string,
	backRoute: OpportunitiesListRouteRef
): DashboardHeader {
	return {
		leading: {
			kind: 'control-title',
			title,
			control: {
				kind: 'back-link',
				route: backRoute,
				label: 'Opportunities & risks'
			}
		},
		actions: ['share', 'broker-switch']
	};
}

export function createMyDealsListHeader(selectedView: MyDealsView): DashboardHeader {
	return {
		leading: {
			kind: 'title-menu',
			title: 'My deals',
			menu: buildHeaderTitleMenu({
				menuId: 'desktop-my-deals-view',
				ariaLabel: 'Change my deals view',
				sectionLabel: 'Select view',
				activeLabel: getMyDealsViewLabel(selectedView),
				selectedId: selectedView,
				options: MY_DEALS_VIEW_OPTIONS,
				buildRoute: (view) => ({
					kind: 'my-deals-list',
					view
				})
			})
		},
		actions: ['share']
	};
}

export function createMyDealsDetailHeader(
	title: string,
	selectedView: MyDealsView
): DashboardHeader {
	return {
		leading: {
			kind: 'control-title',
			title,
			control: {
				kind: 'back-link',
				route: {
					kind: 'my-deals-list',
					view: selectedView
				},
				label: getMyDealsViewLabel(selectedView)
			}
		},
		actions: ['share']
	};
}

export function createAllActivityListHeader(selectedView: AllActivityView): DashboardHeader {
	return {
		leading: {
			kind: 'title-menu',
			title: 'All activity',
			menu: buildHeaderTitleMenu({
				menuId: 'desktop-all-activity-view',
				ariaLabel: 'Change all activity view',
				sectionLabel: 'Select all activity view',
				activeLabel: getAllActivityViewLabel(selectedView),
				selectedId: selectedView,
				options: ALL_ACTIVITY_VIEW_OPTIONS,
				buildRoute: (view) => ({
					kind: 'all-activity-list',
					view
				})
			})
		},
		actions: ['share']
	};
}

export function createAllActivityDetailHeader(
	title: string,
	selectedView: AllActivityView
): DashboardHeader {
	return {
		leading: {
			kind: 'control-title',
			title,
			control: {
				kind: 'back-link',
				route: {
					kind: 'all-activity-list',
					view: selectedView
				},
				label: getAllActivityViewLabel(selectedView)
			}
		},
		actions: ['share']
	};
}
