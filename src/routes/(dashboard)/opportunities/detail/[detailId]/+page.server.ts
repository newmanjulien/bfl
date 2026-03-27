import { error, type Actions } from '@sveltejs/kit';
import { applyDealIndustryUpdate } from '$lib/dashboard/actions/update-industry';
import type { OpportunitiesDetailRouteRef } from '$lib/dashboard/routing';
import { api, createServerConvexClient } from '$lib/server/convex';
import { createPersonSummaryMap, toOrgChartRoot } from '$lib/dashboard/view-models/deal-content';
import type { InsightId } from '$lib/types/ids';

export const prerender = false;

export const load = async ({ params, parent }) => {
	const route = {
		kind: 'opportunities-detail',
		insightId: params.detailId as InsightId
	} satisfies OpportunitiesDetailRouteRef;
	const [layoutData, detail] = await Promise.all([
		parent(),
		createServerConvexClient().query(api.opportunities.getOpportunityDetail, {
			detailId: route.insightId
		})
	]);

	if (!detail) {
		throw error(404, 'Not found');
	}

	const peopleById = createPersonSummaryMap(layoutData.dashboardShell.people);
	const { orgChartNodes, ...pageData } = detail;

	return {
		route,
		...pageData,
		orgChartRoot: toOrgChartRoot(orgChartNodes, peopleById)
	};
};

export const actions = {
	updateIndustry: ({ request, url }) => applyDealIndustryUpdate({ request, url })
} satisfies Actions;
