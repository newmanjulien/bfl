import { error, type Actions } from '@sveltejs/kit';
import { applyDealIndustryUpdate } from '$lib/dashboard/actions/update-industry';
import { isNonDefaultAllActivityView } from '$lib/dashboard/routing/all-activity';
import type { AllActivityDetailRouteRef } from '$lib/dashboard/routing';
import { api, createServerConvexClient } from '$lib/server/convex';
import {
	createPersonSummaryMap,
	toOrgChartRoot,
	type OrgChartNode
} from '$lib/dashboard/view-models/deal-content';
import type { AllActivityDetailQueryResult } from '../../../../../../convex/allActivity';
import type { DealId } from '$lib/types/ids';

export const prerender = false;

type AllActivityDetailPageData = Omit<AllActivityDetailQueryResult, 'orgChartNodes'> & {
	route: AllActivityDetailRouteRef;
	orgChartRoot: OrgChartNode;
};

export const load = async ({ params, parent }): Promise<AllActivityDetailPageData> => {
	if (!isNonDefaultAllActivityView(params.view)) {
		throw error(404, 'Not found');
	}

	const route = {
		kind: 'all-activity-detail',
		dealId: params.detailId as DealId,
		view: params.view
	} satisfies AllActivityDetailRouteRef;
	const [layoutData, detail] = await Promise.all([
		parent(),
		createServerConvexClient().query(api.allActivity.getAllActivityDetail, {
			detailId: route.dealId,
			view: route.view
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
