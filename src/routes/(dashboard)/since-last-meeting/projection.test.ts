import { describe, expect, it } from 'vitest';
import { activeMeetingDateIso } from '$lib/dashboard/meeting-date';
import { mockDb } from '$lib/mock-db';
import { sinceLastMeetingDeals, sinceLastMeetingTimelineItems } from './projection';

describe('since-last-meeting projection', () => {
	it('keeps the timeline and deal list aligned to post-meeting activities', () => {
		const meetingUpdateActivities = mockDb.activities
			.list({ stream: 'meeting-update' })
			.filter((activity) => activity.occurredOnIso >= activeMeetingDateIso)
			.sort(
				(left, right) =>
					left.occurredOnIso.localeCompare(right.occurredOnIso) || left.id.localeCompare(right.id)
			);
		const expectedDealIds = meetingUpdateActivities.flatMap((activity, index, activities) => {
			return activities.findIndex((candidate) => candidate.dealId === activity.dealId) === index
				? [activity.dealId]
				: [];
		});

		expect(sinceLastMeetingTimelineItems.map((item) => item.id)).toEqual(
			meetingUpdateActivities.map((activity) => activity.id)
		);
		expect(sinceLastMeetingDeals.map((deal) => deal.id)).toEqual(expectedDealIds);
		expect(new Set(sinceLastMeetingDeals.map((deal) => deal.id)).size).toBe(
			sinceLastMeetingDeals.length
		);
	});
});
