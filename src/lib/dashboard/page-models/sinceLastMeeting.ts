import { formatIsoDateMonthDayLong } from '$lib/format/date-time';
import type {
	Navigation,
	SinceLastMeetingDetailRouteRef,
	SinceLastMeetingRouteRef
} from '$lib/dashboard/routing';
import type {
	AllActivityDetailReadModel,
	AllActivityDetailRef,
	DashboardShellReadModel,
	SinceLastMeetingReadModel
} from '$lib/dashboard/read-models';
import type { DashboardHeader } from '$lib/dashboard/shell/header/types';
import { buildDealDetailContentPageData, type DealDetailContentPageData } from './allActivity';
import {
	createSinceLastMeetingDetailHeader,
	createSinceLastMeetingHeader
} from './headers';

function toDetailNavigation(
	route: SinceLastMeetingRouteRef,
	detail: AllActivityDetailRef | null
): Navigation<SinceLastMeetingDetailRouteRef> {
	if (!detail) {
		return {
			kind: 'none'
		};
	}

	return {
		kind: 'internal',
		route: {
			kind: 'since-last-meeting-detail',
			dealId: detail.dealId,
			meetingId: route.meetingId
		}
	};
}

export type SinceLastMeetingDealRowPageData = Omit<
	SinceLastMeetingReadModel['deals'][number],
	'detail'
> & {
	navigation: Navigation<SinceLastMeetingDetailRouteRef>;
};

export type SinceLastMeetingPageData = {
	route: SinceLastMeetingRouteRef;
	header: DashboardHeader;
	hero: {
		title: string;
		description: string;
	};
	referenceMeetingDateIso: SinceLastMeetingReadModel['referenceMeetingDateIso'];
	timelineItems: SinceLastMeetingReadModel['timelineItems'];
	deals: SinceLastMeetingDealRowPageData[];
	update: SinceLastMeetingReadModel['update'];
};

export type SinceLastMeetingDetailPageData = {
	route: SinceLastMeetingDetailRouteRef;
	header: DashboardHeader;
} & DealDetailContentPageData;

export function buildSinceLastMeetingPageData(params: {
	route: SinceLastMeetingRouteRef;
	readModel: SinceLastMeetingReadModel;
}): SinceLastMeetingPageData {
	const { route, readModel } = params;

	return {
		route,
		header: createSinceLastMeetingHeader(route),
		hero: {
			title: 'Since your last meeting with Julien',
			description:
				`Get a quick overview of what progress Julien has made since your last meeting on ${formatIsoDateMonthDayLong(readModel.referenceMeetingDateIso)}`
		},
		referenceMeetingDateIso: readModel.referenceMeetingDateIso,
		timelineItems: readModel.timelineItems,
		deals: readModel.deals.map((deal) => ({
			...deal,
			navigation: toDetailNavigation(route, deal.detail)
		})),
		update: readModel.update
	};
}

export function buildSinceLastMeetingDetailPageData(params: {
	route: SinceLastMeetingDetailRouteRef;
	readModel: AllActivityDetailReadModel;
	dashboardShell: DashboardShellReadModel;
}): SinceLastMeetingDetailPageData {
	const { route, readModel, dashboardShell } = params;

	return {
		route,
		header: createSinceLastMeetingDetailHeader(readModel.title, {
			kind: 'since-last-meeting',
			meetingId: route.meetingId
		}),
		...buildDealDetailContentPageData({
			readModel,
			dashboardShell
		})
	};
}
