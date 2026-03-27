import { error } from '@sveltejs/kit';
import { isNonDefaultAllActivityView } from '$lib/dashboard/routing/all-activity';
import type { AllActivityListRouteRef } from '$lib/dashboard/routing';
import { api, createServerConvexClient } from '$lib/server/convex';

export const load = async ({ params }) => {
	if (!isNonDefaultAllActivityView(params.view)) {
		throw error(404, 'Not found');
	}

	const route = {
		kind: 'all-activity-list',
		view: params.view
	} satisfies AllActivityListRouteRef;

	return {
		route,
		...(await createServerConvexClient().query(api.allActivity.getAllActivityList, {
			view: route.view
		}))
	};
};
