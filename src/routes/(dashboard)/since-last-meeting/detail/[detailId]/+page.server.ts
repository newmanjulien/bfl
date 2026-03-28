import { error, redirect, type Actions } from '@sveltejs/kit';
import { applyDealIndustryUpdate } from '$lib/dashboard/actions/update-industry';
import { DEFAULT_ALL_ACTIVITY_VIEW } from '$lib/dashboard/routing/all-activity';
import { resolveDashboardRoute } from '$lib/dashboard/routing';
import { requireDashboardRouteKind } from '$lib/dashboard/page-models/layout';
import { buildSinceLastMeetingDetailPageData } from '$lib/dashboard/page-models/sinceLastMeeting';
import { resolveSelectedMeetingId } from '$lib/server/meetings';
import { api, createServerConvexClient } from '$lib/server/convex';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ parent }) => {
	const layoutData = await parent();
	const route = requireDashboardRouteKind(layoutData.route, 'since-last-meeting-detail');
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

	const sinceLastMeetingReadModel = await createServerConvexClient().query(
		api.sinceLastMeeting.getSinceLastMeeting,
		{
			meetingId
		}
	);
	const isDealInSelectedMeeting = sinceLastMeetingReadModel.deals.some(
		(deal) => deal.id === route.dealId && deal.detail?.dealId === route.dealId
	);

	if (!isDealInSelectedMeeting) {
		throw error(404, 'Not found');
	}

	const readModel = await createServerConvexClient().query(api.allActivity.getAllActivityDetail, {
		detailId: route.dealId,
		view: DEFAULT_ALL_ACTIVITY_VIEW
	});

	if (!readModel) {
		throw error(404, 'Not found');
	}

	return buildSinceLastMeetingDetailPageData({
		route,
		readModel,
		dashboardShell: layoutData.dashboardShell
	});
};

export const actions = {
	updateIndustry: ({ request, url }) => applyDealIndustryUpdate({ request, url })
} satisfies Actions;
