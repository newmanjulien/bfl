import { buildOpportunitiesListPageData } from '$lib/dashboard/page-models/opportunities';
import { requireDashboardRouteKind } from '$lib/dashboard/page-models/layout';
import { api, createServerConvexClient } from '$lib/server/convex';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const layoutData = await parent();
	const route = requireDashboardRouteKind(layoutData.route, 'opportunities-list');
	const readModel = await createServerConvexClient().query(api.opportunities.getOpportunitiesList);

	return buildOpportunitiesListPageData({ route, readModel });
};
