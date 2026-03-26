import { activeMeetingDateIso } from '$lib/dashboard/meeting-date';
import { sortDealActivitiesAscending } from '$lib/dashboard/deal-derivations';
import {
	createPersonSummaryMap,
	toTimelineItem
} from '$lib/dashboard/deal-view';
import { mockDb } from '$lib/mock-db';
import type { DealSummaryRow } from '$lib/presentation/deal-summary';

export const sinceLastMeetingReferenceIso = activeMeetingDateIso;

function getMeetingUpdateActivities() {
	return sortDealActivitiesAscending(
		mockDb.activities
			.list({ stream: 'meeting-update' })
			.filter((activity) => activity.occurredOnIso >= sinceLastMeetingReferenceIso)
	);
}

export function getSinceLastMeetingTimelineItems() {
	const peopleById = createPersonSummaryMap(mockDb.brokers.list());

	return getMeetingUpdateActivities().map((activity) => toTimelineItem(activity, peopleById));
}

export function getSinceLastMeetingDeals() {
	const seenDealIds = new Set<string>();

	return getMeetingUpdateActivities()
		.flatMap((activity) => {
			if (seenDealIds.has(activity.dealId)) {
				return [];
			}

			seenDealIds.add(activity.dealId);
			return [mockDb.deals.requireById(activity.dealId)];
		})
		.map((deal) => {
			return {
				id: deal.dealId,
				deal: deal.dealName,
				probability: deal.probability,
				activityLevel: deal.activityLevel,
				stage: deal.stage
			};
		}) satisfies readonly DealSummaryRow[];
}
