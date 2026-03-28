import { query } from './_generated/server';
import { sortDealActivitiesAscending } from '../lib/dashboard/view-models/deal';
import {
	createPersonSummaryMap,
	toTimelineItem
} from '../lib/dashboard/view-models/deal-content';
import {
	requireMeetingScheduleDocument,
	toActivityRecord,
	toDashboardPeople,
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
				id: deal.id,
				deal: deal.dealName,
				probability: deal.probability,
				activityLevel: deal.activityLevel,
				stage: deal.stage
			}
		];
	});
}

export const getSinceLastMeeting = query({
	args: {},
	returns: sinceLastMeetingReadModelValidator,
	handler: async (ctx): Promise<SinceLastMeetingReadModel> => {
		const meetingSchedule = await requireMeetingScheduleDocument(ctx);
		const [brokers, activities, deals] = await Promise.all([
			ctx.db.query('brokers').collect(),
			ctx.db
				.query('activities')
				.withIndex('by_stream_occurred_on_iso', (query) => query.eq('stream', 'meeting-update'))
				.collect(),
			ctx.db.query('deals').collect()
		]);
		const people = await toDashboardPeople(ctx, brokers);
		const peopleById = createPersonSummaryMap(people);
		const meetingUpdateActivities = sortDealActivitiesAscending(
			activities
				.map((activity) => toActivityRecord(activity))
				.filter((activity) => activity.occurredOnIso >= meetingSchedule.activeMeetingDateIso)
		);
		const dealRecords = deals.map((deal) => toDealRecord(deal));

		return {
			referenceMeetingDateIso: meetingSchedule.activeMeetingDateIso,
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
