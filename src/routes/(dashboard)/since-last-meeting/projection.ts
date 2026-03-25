import { sortDealActivitiesAscending } from '$lib/dashboard/deal-derivations';
import { activeMeetingDateIso } from '$lib/dashboard/meeting-date';
import { toTimelineItem } from '$lib/dashboard/deal-view';
import { mockDb } from '$lib/mock-db';
import type { DealSummaryRow } from '$lib/presentation/deal-summary';

export const sinceLastMeetingReferenceIso = activeMeetingDateIso;

const meetingUpdateActivities = sortDealActivitiesAscending(
	mockDb.activities
		.list({ stream: 'meeting-update' })
		.filter((activity) => activity.occurredOnIso >= sinceLastMeetingReferenceIso)
);

export const sinceLastMeetingTimelineItems = meetingUpdateActivities
	.map((activity) => toTimelineItem(activity));

const seenDealIds = new Set<string>();
const dealsSinceLastMeeting = meetingUpdateActivities.flatMap((activity) => {
	if (seenDealIds.has(activity.dealId)) {
		return [];
	}

	seenDealIds.add(activity.dealId);
	return [mockDb.deals.requireById(activity.dealId)];
});

export const sinceLastMeetingDeals = dealsSinceLastMeeting
	.map((deal) => {
		return {
			id: deal.dealId,
			deal: deal.dealName,
			probability: deal.probability,
			activityLevel: deal.activityLevel,
			stage: deal.stage
		};
	}) satisfies readonly DealSummaryRow[];
