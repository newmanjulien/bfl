import { buildSinceLastMeetingPageData } from '$lib/dashboard/page-models/sinceLastMeeting';
import { requireDashboardRouteKind } from '$lib/dashboard/page-models/layout';
import { api, createServerConvexClient } from '$lib/server/convex';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const layoutData = await parent();
	const route = requireDashboardRouteKind(layoutData.route, 'since-last-meeting');
	const readModel = await createServerConvexClient().query(api.sinceLastMeeting.getSinceLastMeeting);

	return buildSinceLastMeetingPageData({ route, readModel });
};
