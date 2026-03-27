import type { DashboardHeader } from '$lib/dashboard/shell/header/types';
import type {
	AllActivityDetailRouteRef,
	AllActivityListRouteRef,
	Navigation
} from '$lib/dashboard/routing';
import {
	createPersonSummaryMap,
	toOrgChartRoot,
	type OrgChartNode
} from '$lib/dashboard/view-models/deal-content';
import type {
	AllActivityDetailReadModel,
	AllActivityDetailRef,
	AllActivityListReadModel,
	DashboardShellReadModel
} from '$lib/dashboard/read-models';
import { createAllActivityDetailHeader, createAllActivityListHeader } from './headers';

function toDetailNavigation(
	route: AllActivityListRouteRef,
	detail: AllActivityDetailRef | null
): Navigation<AllActivityDetailRouteRef> {
	if (!detail) {
		return {
			kind: 'none'
		};
	}

	return {
		kind: 'internal',
		route: {
			kind: 'all-activity-detail',
			dealId: detail.dealId,
			view: route.view
		}
	};
}

export type AllActivityTableRowPageData = Omit<AllActivityListReadModel['rows'][number], 'detail'> & {
	navigation: Navigation<AllActivityDetailRouteRef>;
};

export type AllActivityListPageData = {
	route: AllActivityListRouteRef;
	header: DashboardHeader;
	rows: AllActivityTableRowPageData[];
	filterDrawerData: AllActivityListReadModel['filterDrawerData'];
};

export type AllActivityDetailPageData = {
	route: AllActivityDetailRouteRef;
	header: DashboardHeader;
	hero: AllActivityDetailReadModel['hero'];
	activityItems: AllActivityDetailReadModel['activityItems'];
	orgChartRoot: OrgChartNode;
	update: AllActivityDetailReadModel['update'];
	rightRail: AllActivityDetailReadModel['rightRail'];
};

export function buildAllActivityListPageData(params: {
	route: AllActivityListRouteRef;
	readModel: AllActivityListReadModel;
}): AllActivityListPageData {
	const { route, readModel } = params;

	return {
		route,
		header: createAllActivityListHeader(route.view),
		rows: readModel.rows.map((row) => ({
			...row,
			navigation: toDetailNavigation(route, row.detail)
		})),
		filterDrawerData: readModel.filterDrawerData
	};
}

export function buildAllActivityDetailPageData(params: {
	route: AllActivityDetailRouteRef;
	readModel: AllActivityDetailReadModel;
	dashboardShell: DashboardShellReadModel;
}): AllActivityDetailPageData {
	const { route, readModel, dashboardShell } = params;
	const peopleById = createPersonSummaryMap(dashboardShell.people);

	return {
		route,
		header: createAllActivityDetailHeader(readModel.title, route.view),
		hero: readModel.hero,
		activityItems: readModel.activityItems,
		orgChartRoot: toOrgChartRoot(readModel.orgChartNodes, peopleById),
		update: readModel.update,
		rightRail: readModel.rightRail
	};
}
