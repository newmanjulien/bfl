import { formatIsoDateMonthDayLong } from '$lib/format/date-time';
import type { SinceLastMeetingRouteRef } from '$lib/dashboard/routing';
import type { SinceLastMeetingReadModel } from '$lib/dashboard/read-models';
import type { DashboardHeader } from '$lib/dashboard/shell/header/types';
import { createSinceLastMeetingHeader } from './headers';

export type SinceLastMeetingPageData = {
	route: SinceLastMeetingRouteRef;
	header: DashboardHeader;
	hero: {
		title: string;
		description: string;
	};
	referenceMeetingDateIso: SinceLastMeetingReadModel['referenceMeetingDateIso'];
	timelineItems: SinceLastMeetingReadModel['timelineItems'];
	deals: SinceLastMeetingReadModel['deals'];
	update: SinceLastMeetingReadModel['update'];
};

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
		deals: readModel.deals,
		update: readModel.update
	};
}
