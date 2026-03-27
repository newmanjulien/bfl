import type {
	AllActivityListRouteRef,
	MyDealsListRouteRef,
	OpportunitiesListRouteRef
} from '$lib/dashboard/routing';

export type DashboardHeaderBackLinkRouteRef =
	| MyDealsListRouteRef
	| AllActivityListRouteRef
	| OpportunitiesListRouteRef;

export type DashboardHeaderTitleMenuRouteRef =
	| MyDealsListRouteRef
	| AllActivityListRouteRef;

export type DashboardHeaderControl =
	| {
			kind: 'meeting-date';
	  }
	| {
			kind: 'back-link';
			route: DashboardHeaderBackLinkRouteRef;
			label: string;
	  };

export type DashboardHeaderAction = 'share' | 'broker-switch';

export type DashboardHeaderTitleMenuOption = {
	id: string;
	label: string;
	route: DashboardHeaderTitleMenuRouteRef;
	current: boolean;
};

export type DashboardHeaderTitleMenu = {
	kind: 'link-menu';
	menuId: string;
	ariaLabel: string;
	sectionLabel: string;
	activeLabel: string;
	options: DashboardHeaderTitleMenuOption[];
};

export type DashboardHeaderLeading =
	| {
			kind: 'title';
			title: string;
	  }
	| {
			kind: 'title-menu';
			title: string;
			menu: DashboardHeaderTitleMenu;
	  }
	| {
			kind: 'control-title';
			control: DashboardHeaderControl;
			title: string;
	  };

export type DashboardHeader = {
	leading: DashboardHeaderLeading;
	actions?: DashboardHeaderAction[];
};
