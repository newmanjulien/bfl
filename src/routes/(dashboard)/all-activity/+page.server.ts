import { DEFAULT_ALL_ACTIVITY_VIEW } from '$lib/dashboard/routing/all-activity';
import type { AllActivityListRouteRef } from '$lib/dashboard/routing';
import { api, createServerConvexClient } from '$lib/server/convex';

export const load = async () => {
	const route = {
		kind: 'all-activity-list',
		view: DEFAULT_ALL_ACTIVITY_VIEW
	} satisfies AllActivityListRouteRef;

	return {
		route,
		...(await createServerConvexClient().query(api.allActivity.getAllActivityList, {
			view: route.view
		}))
	};
};
