import type { DashboardHeader } from '$lib/dashboard/shell/header/types';
import { buildHeaderTitleMenu } from '$lib/dashboard/shell/header/title-menu';
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

export function createSinceLastMeetingHeader(): DashboardHeader {
	return {
		leading: {
			kind: 'control-title',
			title: 'Since last meeting',
			control: { kind: 'meeting-date' }
		},
		actions: ['share', 'broker-switch']
	};
}

export function createOpportunitiesListHeader(): DashboardHeader {
	return {
		leading: {
			kind: 'control-title',
			title: 'Opportunities & risks',
			control: { kind: 'meeting-date' }
		},
		actions: ['share', 'broker-switch']
	};
}

export function createOpportunitiesDetailHeader(title: string): DashboardHeader {
	return {
		leading: {
			kind: 'control-title',
			title,
			control: {
				kind: 'back-link',
				route: {
					kind: 'opportunities-list'
				},
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
