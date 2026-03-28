import { error, type Actions } from '@sveltejs/kit';
import { applyDealIndustryUpdate } from '$lib/dashboard/actions/update-industry';
import { buildNewBusinessDetailPageData } from '$lib/dashboard/page-models/newBusiness';
import { requireDashboardRouteKind } from '$lib/dashboard/page-models/layout';
import { api, createServerConvexClient } from '$lib/server/convex';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ parent }) => {
	const layoutData = await parent();
	const route = requireDashboardRouteKind(layoutData.route, 'new-business-detail');
	const readModel = await createServerConvexClient().query(api.newBusiness.getNewBusinessDetail, {
		dealKey: route.dealKey,
		view: route.view
	});

	if (!readModel) {
		throw error(404, 'Not found');
	}

	return buildNewBusinessDetailPageData({
		route,
		readModel,
		dashboardShell: layoutData.dashboardShell
	});
};

export const actions = {
	updateIndustry: ({ request, url }) => applyDealIndustryUpdate({ request, url })
} satisfies Actions;
