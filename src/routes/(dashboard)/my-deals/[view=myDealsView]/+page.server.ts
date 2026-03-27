import { error } from '@sveltejs/kit';
import { isNonDefaultMyDealsView } from '$lib/dashboard/routing/my-deals';
import type { MyDealsListRouteRef } from '$lib/dashboard/routing';
import { api, createServerConvexClient } from '$lib/server/convex';
import { resolveMyDealsActiveBrokerIdFromParent } from '../data/active-broker';

export const load = async ({ params, parent }) => {
	if (!isNonDefaultMyDealsView(params.view)) {
		throw error(404, 'Not found');
	}

	const activeBrokerId = await resolveMyDealsActiveBrokerIdFromParent(parent);
	const route = {
		kind: 'my-deals-list',
		view: params.view
	} satisfies MyDealsListRouteRef;

	return {
		route,
		...(await createServerConvexClient().query(api.myDeals.getMyDealsList, {
		brokerId: activeBrokerId,
			view: route.view
		}))
	};
};
