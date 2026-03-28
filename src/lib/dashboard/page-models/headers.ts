import type {
	MyDealsListRouteRef,
	NewBusinessListRouteRef,
	OpportunitiesListRouteRef,
	SinceLastMeetingRouteRef
} from '$lib/dashboard/routing';
import type { DashboardHeader } from '$lib/dashboard/shell/header/types';
import {
	NEW_BUSINESS_VIEW_OPTIONS,
	getNewBusinessViewLabel,
	type NewBusinessView
} from '$lib/dashboard/routing/new-business';
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
	buildRoute: (id: TId) => MyDealsListRouteRef | NewBusinessListRouteRef;
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

export function createNewBusinessListHeader(selectedView: NewBusinessView): DashboardHeader {
	return {
		leading: {
			kind: 'title-menu',
			title: 'New business',
			menu: buildHeaderTitleMenu({
				menuId: 'desktop-new-business-view',
				ariaLabel: 'Change new business view',
				sectionLabel: 'Select new business view',
				activeLabel: getNewBusinessViewLabel(selectedView),
				selectedId: selectedView,
				options: NEW_BUSINESS_VIEW_OPTIONS,
				buildRoute: (view) => ({
					kind: 'new-business-list',
					view
				})
			})
		},
		actions: ['share']
	};
}

export function createNewBusinessDetailHeader(
	title: string,
	selectedView: NewBusinessView
): DashboardHeader {
	return {
		leading: {
			kind: 'control-title',
			title,
			control: {
				kind: 'back-link',
				route: {
					kind: 'new-business-list',
					view: selectedView
				},
				label: getNewBusinessViewLabel(selectedView)
			}
		},
		actions: ['share']
	};
}
