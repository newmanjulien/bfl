import type { DashboardHeader } from '$lib/dashboard/shell/header/types';
import type {
	OpportunitiesDetailRouteRef,
	OpportunitiesListRouteRef
} from '$lib/dashboard/routing';
import {
	createPersonSummaryMap,
	toOrgChartRoot,
	type OrgChartNode
} from '$lib/dashboard/view-models/deal-content';
import type {
	DashboardShellReadModel,
	OpportunityDetailReadModel,
	OpportunityDetailRef,
	OpportunitiesListReadModel
} from '$lib/dashboard/read-models';
import { createOpportunitiesDetailHeader, createOpportunitiesListHeader } from './headers';

const OPPORTUNITIES_HERO = {
	title: 'Opportunities & risks you might help with',
	description: 'Help Julien take advantage of key opportunities and risks'
} as const;

function toDetailRoute(detail: OpportunityDetailRef): OpportunitiesDetailRouteRef {
	return {
		kind: 'opportunities-detail',
		insightId: detail.insightId,
		meetingId: null
	};
}

export type OpportunityTilePageData = Omit<OpportunitiesListReadModel['opportunityTiles'][number], 'detail'> & {
	route: OpportunitiesDetailRouteRef;
};

export type OpportunitiesListPageData = {
	route: OpportunitiesListRouteRef;
	header: DashboardHeader;
	hero: typeof OPPORTUNITIES_HERO;
	opportunityTiles: OpportunityTilePageData[];
	riskTiles: OpportunityTilePageData[];
	update: OpportunitiesListReadModel['update'];
};

export type OpportunityDetailPageData = {
	route: OpportunitiesDetailRouteRef;
	header: DashboardHeader;
	hero: OpportunityDetailReadModel['hero'];
	kind: OpportunityDetailReadModel['kind'];
	activityItems: OpportunityDetailReadModel['activityItems'];
	orgChartRoot: OrgChartNode;
	update: OpportunityDetailReadModel['update'];
	rightRail: OpportunityDetailReadModel['rightRail'];
};

export function buildOpportunitiesListPageData(params: {
	route: OpportunitiesListRouteRef;
	readModel: OpportunitiesListReadModel;
}): OpportunitiesListPageData {
	const { route, readModel } = params;

	return {
		route,
		header: createOpportunitiesListHeader(route),
		hero: OPPORTUNITIES_HERO,
		opportunityTiles: readModel.opportunityTiles.map((tile) => ({
			...tile,
			route: {
				...toDetailRoute(tile.detail),
				meetingId: route.meetingId
			}
		})),
		riskTiles: readModel.riskTiles.map((tile) => ({
			...tile,
			route: {
				...toDetailRoute(tile.detail),
				meetingId: route.meetingId
			}
		})),
		update: readModel.update
	};
}

export function buildOpportunityDetailPageData(params: {
	route: OpportunitiesDetailRouteRef;
	readModel: OpportunityDetailReadModel;
	dashboardShell: DashboardShellReadModel;
}): OpportunityDetailPageData {
	const { route, readModel, dashboardShell } = params;
	const peopleById = createPersonSummaryMap(dashboardShell.people);

	return {
		route,
		header: createOpportunitiesDetailHeader(readModel.title, {
			kind: 'opportunities-list',
			meetingId: route.meetingId
		}),
		hero: readModel.hero,
		kind: readModel.kind,
		activityItems: readModel.activityItems,
		orgChartRoot: toOrgChartRoot(readModel.orgChartNodes, peopleById),
		update: readModel.update,
		rightRail: readModel.rightRail
	};
}
