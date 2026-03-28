import { redirect } from '@sveltejs/kit';
import { resolveDashboardRoute } from '$lib/dashboard/routing';
import { buildOpportunitiesListPageData } from '$lib/dashboard/page-models/opportunities';
import { requireDashboardRouteKind } from '$lib/dashboard/page-models/layout';
import { resolveSelectedMeetingId } from '$lib/server/meetings';
import { api, createServerConvexClient } from '$lib/server/convex';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const layoutData = await parent();
	const route = requireDashboardRouteKind(layoutData.route, 'opportunities-list');
	const meetingId = resolveSelectedMeetingId(layoutData.dashboardShell, route.meetingId);

	if (route.meetingId !== meetingId) {
		throw redirect(
			308,
			resolveDashboardRoute({
				...route,
				meetingId
			})
		);
	}

	const readModel = await createServerConvexClient().query(api.opportunities.getOpportunitiesList, {
		meetingId
	});

	return buildOpportunitiesListPageData({ route, readModel });
};
