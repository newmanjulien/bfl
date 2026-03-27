import { error, type Actions } from '@sveltejs/kit';
import { applyDealIndustryUpdate } from '$lib/dashboard/actions/update-industry';
import {
	DEFAULT_MY_DEALS_VIEW,
	resolveMyDealsDetailTabId
} from '$lib/dashboard/routing/my-deals';
import type { MyDealsDetailRouteRef } from '$lib/dashboard/routing';
import { api, createServerConvexClient } from '$lib/server/convex';
import type { MyDealsDetailQueryResult } from '../../../../../convex/myDeals';
import type { DealId } from '$lib/types/ids';
import { resolveMyDealsActiveBrokerIdFromParent } from '../../data/active-broker';

export const prerender = false;

type MyDealsDetailPageData = MyDealsDetailQueryResult & {
	route: MyDealsDetailRouteRef;
};

export const load = async ({ params, parent, url }): Promise<MyDealsDetailPageData> => {
	const activeBrokerId = await resolveMyDealsActiveBrokerIdFromParent(parent);
	const route = {
		kind: 'my-deals-detail',
		dealId: params.detailId as DealId,
		view: DEFAULT_MY_DEALS_VIEW,
		tab: resolveMyDealsDetailTabId(url.searchParams.get('tab'))
	} satisfies MyDealsDetailRouteRef;
	const detail = await createServerConvexClient().query(api.myDeals.getMyDealsDetail, {
		detailId: route.dealId,
		brokerId: activeBrokerId,
		view: route.view
	});

	if (!detail) {
		throw error(404, 'Not found');
	}

	return {
		route,
		...detail
	};
};

export const actions = {
	updateIndustry: ({ request, url }) => applyDealIndustryUpdate({ request, url })
} satisfies Actions;
