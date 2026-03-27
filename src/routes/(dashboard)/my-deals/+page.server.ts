import { DEFAULT_MY_DEALS_VIEW } from '$lib/dashboard/routing/my-deals';
import type { MyDealsListRouteRef } from '$lib/dashboard/routing';
import { api, createServerConvexClient } from '$lib/server/convex';
import { resolveMyDealsActiveBrokerIdFromParent } from './data/active-broker';

export const load = async ({ parent }) => {
	const activeBrokerId = await resolveMyDealsActiveBrokerIdFromParent(parent);
	const route = {
		kind: 'my-deals-list',
		view: DEFAULT_MY_DEALS_VIEW
	} satisfies MyDealsListRouteRef;

	return {
		route,
		...(await createServerConvexClient().query(api.myDeals.getMyDealsList, {
		brokerId: activeBrokerId,
			view: route.view
		}))
	};
};
