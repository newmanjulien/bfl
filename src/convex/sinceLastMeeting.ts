import { v } from 'convex/values';
import { query } from './_generated/server';
import { sortDealActivitiesAscending } from '../lib/dashboard/view-models/deal';
import type { MeetingKey } from '../lib/types/keys';
import { toTimelineItem } from '../lib/dashboard/view-models/deal-content';
import {
	createDashboardPersonByBrokerIdMap,
	requireMeetingRecordByKey,
	toActivityRecord,
	toBrokerRecord,
	toDealRecord
} from './readModels';
import {
	type SinceLastMeetingReadModel,
	sinceLastMeetingReadModelValidator
} from './validators';

export type { SinceLastMeetingReadModel } from './validators';

function createDealByIdMap(deals: readonly ReturnType<typeof toDealRecord>[]) {
	return new Map(deals.map((deal) => [deal.id, deal] as const));
}

function toSinceLastMeetingDeals(
	meetingUpdateActivities: readonly ReturnType<typeof toActivityRecord>[],
	dealsById: ReadonlyMap<string, ReturnType<typeof toDealRecord>>
) {
	const seenDealIds = new Set<string>();

	return meetingUpdateActivities.flatMap((activity) => {
		if (seenDealIds.has(activity.dealId)) {
			return [];
		}

		const deal = dealsById.get(activity.dealId);

		if (!deal) {
			throw new Error(`Unknown deal id "${activity.dealId}" in meeting update activity.`);
		}

		seenDealIds.add(activity.dealId);

		return [
			{
				key: deal.key,
				deal: deal.dealName,
				probability: deal.probability,
				activityLevel: deal.activityLevel,
				stage: deal.stage
			}
		];
	});
}

export const getSinceLastMeeting = query({
	args: {
		meetingKey: v.string()
	},
	returns: sinceLastMeetingReadModelValidator,
	handler: async (ctx, args): Promise<SinceLastMeetingReadModel> => {
		const [meeting, brokers, deals] = await Promise.all([
			requireMeetingRecordByKey(ctx, args.meetingKey as MeetingKey),
			ctx.db.query('brokers').collect(),
			ctx.db.query('deals').collect()
		]);
		const activities = await ctx.db
			.query('activities')
			.withIndex('by_meeting_id_stream_occurred_on_iso', (query) =>
				query.eq('meetingId', meeting.id).eq('stream', 'meeting-update')
			)
			.collect();
		const brokerRecords = await Promise.all(brokers.map((broker) => toBrokerRecord(ctx, broker)));
		const peopleById = createDashboardPersonByBrokerIdMap(brokerRecords);
		const meetingUpdateActivities = sortDealActivitiesAscending(
			activities.map((activity) => toActivityRecord(activity))
		);
		const dealRecords = deals.map((deal) => toDealRecord(deal));

		return {
			referenceMeetingDateIso: meeting.dateIso,
			timelineItems: meetingUpdateActivities.map((activity) => toTimelineItem(activity, peopleById)),
			deals: toSinceLastMeetingDeals(meetingUpdateActivities, createDealByIdMap(dealRecords)),
			update: {
				sectionId: 'update',
				uploadLabel: 'Upload files',
				uploadDescription: "Upload screenshots or any docs with the information we're missing"
			}
		};
	}
});
