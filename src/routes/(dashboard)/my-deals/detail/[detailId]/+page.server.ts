import { error, type Actions } from '@sveltejs/kit';
import { applyDealIndustryUpdate } from '$lib/dashboard/actions/update-industry';
import { buildMyDealsDetailPageData } from '$lib/dashboard/page-models/myDeals';
import { requireDashboardRouteKind } from '$lib/dashboard/page-models/layout';
import { api, createServerConvexClient } from '$lib/server/convex';
import { resolveMyDealsActiveBrokerId } from '../../data/active-broker';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ parent }) => {
	const layoutData = await parent();
	const route = requireDashboardRouteKind(layoutData.route, 'my-deals-detail');
	const activeBrokerId = resolveMyDealsActiveBrokerId(layoutData.dashboardShell.people);
	const readModel = await createServerConvexClient().query(api.myDeals.getMyDealsDetail, {
		detailId: route.dealId,
		brokerId: activeBrokerId,
		view: route.view
	});

	if (!readModel) {
		throw error(404, 'Not found');
	}

	return buildMyDealsDetailPageData({ route, readModel });
};

export const actions = {
	updateIndustry: ({ request, url }) => applyDealIndustryUpdate({ request, url })
} satisfies Actions;
