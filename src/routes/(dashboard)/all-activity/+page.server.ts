import type { DashboardHeaderTitleMenu } from '$lib/dashboard/shell/dashboard-header';
import {
	ALL_ACTIVITY_VIEW_OPTIONS,
	buildAllActivityListHref,
	getAllActivityRowsForView,
	getAllActivityViewLabel,
	parseAllActivityView
} from './projection';

export const load = ({ url }) => {
	const selectedView = parseAllActivityView(url.searchParams.get('view'));
	const headerTitleMenu = {
		kind: 'link-menu',
		menuId: 'desktop-all-activity-view',
		ariaLabel: 'Change all activity view',
		sectionLabel: 'Select all activity view',
		activeLabel: getAllActivityViewLabel(selectedView),
		options: ALL_ACTIVITY_VIEW_OPTIONS.map((option) => ({
			id: option.id,
			label: option.label,
			href: buildAllActivityListHref(option.id),
			current: option.id === selectedView
		}))
	} satisfies DashboardHeaderTitleMenu;

	return {
		selectedView,
		rows: getAllActivityRowsForView(selectedView),
		headerTitleMenu
	};
};
