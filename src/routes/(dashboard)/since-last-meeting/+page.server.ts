import { api, createServerConvexClient } from '$lib/server/convex';

export const load = async () => ({
	route: {
		kind: 'since-last-meeting'
	} as const,
	...(await createServerConvexClient().query(api.sinceLastMeeting.getSinceLastMeeting))
});
