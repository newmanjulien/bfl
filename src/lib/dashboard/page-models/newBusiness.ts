import type { DashboardHeader } from '$lib/dashboard/shell/header/types';
import type {
	Navigation,
	NewBusinessDetailRouteRef,
	NewBusinessListRouteRef
} from '$lib/dashboard/routing';
import {
	createPersonSummaryMap,
	toOrgChartRoot,
	type OrgChartNode
} from '$lib/dashboard/view-models/deal-content';
import type {
	DashboardShellReadModel,
	NewBusinessDetailReadModel,
	NewBusinessDetailRef,
	NewBusinessListReadModel
} from '$lib/dashboard/read-models';
import { createNewBusinessDetailHeader, createNewBusinessListHeader } from './headers';

function toDetailNavigation(
	route: NewBusinessListRouteRef,
	detail: NewBusinessDetailRef | null
): Navigation<NewBusinessDetailRouteRef> {
	if (!detail) {
		return {
			kind: 'none'
		};
	}

	return {
		kind: 'internal',
		route: {
			kind: 'new-business-detail',
			dealKey: detail.dealKey,
			view: route.view
		}
	};
}

export type NewBusinessTableRowPageData = Omit<NewBusinessListReadModel['rows'][number], 'detail'> & {
	navigation: Navigation<NewBusinessDetailRouteRef>;
};

export type NewBusinessListPageData = {
	route: NewBusinessListRouteRef;
	header: DashboardHeader;
	rows: NewBusinessTableRowPageData[];
	filterDrawerData: NewBusinessListReadModel['filterDrawerData'];
};

export type NewBusinessDetailPageData = {
	route: NewBusinessDetailRouteRef;
	header: DashboardHeader;
	hero: NewBusinessDetailReadModel['hero'];
	activityItems: NewBusinessDetailReadModel['activityItems'];
	orgChartRoot: OrgChartNode;
	update: NewBusinessDetailReadModel['update'];
	rightRail: NewBusinessDetailReadModel['rightRail'];
};

export function buildNewBusinessListPageData(params: {
	route: NewBusinessListRouteRef;
	readModel: NewBusinessListReadModel;
}): NewBusinessListPageData {
	const { route, readModel } = params;

	return {
		route,
		header: createNewBusinessListHeader(route.view),
		rows: readModel.rows.map((row) => ({
			...row,
			navigation: toDetailNavigation(route, row.detail)
		})),
		filterDrawerData: readModel.filterDrawerData
	};
}

export function buildNewBusinessDetailPageData(params: {
	route: NewBusinessDetailRouteRef;
	readModel: NewBusinessDetailReadModel;
	dashboardShell: DashboardShellReadModel;
}): NewBusinessDetailPageData {
	const { route, readModel, dashboardShell } = params;
	const peopleById = createPersonSummaryMap(dashboardShell.people);

	return {
		route,
		header: createNewBusinessDetailHeader(readModel.title, route.view),
		hero: readModel.hero,
		activityItems: readModel.activityItems,
		orgChartRoot: toOrgChartRoot(readModel.orgChartNodes, peopleById),
		update: readModel.update,
		rightRail: readModel.rightRail
	};
}
