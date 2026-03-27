import { api, createServerConvexClient } from '$lib/server/convex';

export const load = async () => ({
	route: {
		kind: 'opportunities-list'
	} as const,
	...(await createServerConvexClient().query(api.opportunities.getOpportunitiesList))
});
