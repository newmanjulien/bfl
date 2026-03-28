import {
	buildMyDealsListPageData
} from '$lib/dashboard/page-models/myDeals';
import {
	requireDashboardRouteKind
} from '$lib/dashboard/page-models/layout';
import { resolveDefaultBrokerId } from '$lib/server/brokers';
import { api, createServerConvexClient } from '$lib/server/convex';
import { resolveMyDealsActiveBrokerId } from './data/active-broker';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const layoutData = await parent();
	const route = requireDashboardRouteKind(layoutData.route, 'my-deals-list');
	const activeBrokerId = resolveMyDealsActiveBrokerId(
		layoutData.dashboardShell.people,
		resolveDefaultBrokerId()
	);
	const readModel = await createServerConvexClient().query(api.myDeals.getMyDealsList, {
		brokerId: activeBrokerId,
		view: route.view
	});

	return buildMyDealsListPageData({ route, readModel, activeBrokerId });
};
