import { error } from '@sveltejs/kit';
import {
	ALL_ACTIVITY_VIEW_OPTIONS,
	DEFAULT_ALL_ACTIVITY_VIEW,
	buildAllActivityListHref,
	getAllActivityViewLabel,
	type AllActivityView
} from '$lib/dashboard/all-activity-routes';
import type { DashboardHeaderTitleMenu } from '$lib/dashboard/shell/dashboard-header';
import {
	getAllActivityDetailViewById,
	getAllActivityRowsForView
} from './projection';

function buildAllActivityHeaderTitleMenu(selectedView: AllActivityView) {
	return {
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
}

export function loadAllActivityListData(selectedView: AllActivityView = DEFAULT_ALL_ACTIVITY_VIEW) {
	return {
		selectedView,
		rows: getAllActivityRowsForView(selectedView),
		headerTitleMenu: buildAllActivityHeaderTitleMenu(selectedView)
	};
}

export function loadAllActivityDetailData(
	detailId: string,
	selectedView: AllActivityView = DEFAULT_ALL_ACTIVITY_VIEW
) {
	const detail = getAllActivityDetailViewById(detailId);

	if (!detail) {
		throw error(404, 'Not found');
	}

	return {
		hero: detail.hero,
		activityItems: detail.activityItems,
		orgChartRoot: detail.orgChartRoot,
		update: detail.update,
		rightRail: detail.rightRail,
		headerBackHref: buildAllActivityListHref(selectedView)
	};
}
