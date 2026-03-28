import { error, redirect, type Actions } from '@sveltejs/kit';
import { applyDealIndustryUpdate } from '$lib/dashboard/actions/update-industry';
import { resolveDashboardRoute } from '$lib/dashboard/routing';
import { buildOpportunityDetailPageData } from '$lib/dashboard/page-models/opportunities';
import { requireDashboardRouteKind } from '$lib/dashboard/page-models/layout';
import { resolveSelectedMeetingId } from '$lib/server/meetings';
import { api, createServerConvexClient } from '$lib/server/convex';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ parent }) => {
	const layoutData = await parent();
	const route = requireDashboardRouteKind(layoutData.route, 'opportunities-detail');
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

	const readModel = await createServerConvexClient().query(api.opportunities.getOpportunityDetail, {
		detailId: route.insightId,
		meetingId
	});

	if (!readModel) {
		throw error(404, 'Not found');
	}

	return buildOpportunityDetailPageData({
		route,
		readModel,
		dashboardShell: layoutData.dashboardShell
	});
};

export const actions = {
	updateIndustry: ({ request, url }) => applyDealIndustryUpdate({ request, url })
} satisfies Actions;
