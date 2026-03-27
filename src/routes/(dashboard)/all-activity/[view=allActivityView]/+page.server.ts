import { buildAllActivityListPageData } from '$lib/dashboard/page-models/allActivity';
import { requireDashboardRouteKind } from '$lib/dashboard/page-models/layout';
import { api, createServerConvexClient } from '$lib/server/convex';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const layoutData = await parent();
	const route = requireDashboardRouteKind(layoutData.route, 'all-activity-list');
	const readModel = await createServerConvexClient().query(api.allActivity.getAllActivityList, {
		view: route.view
	});

	return buildAllActivityListPageData({ route, readModel });
};
