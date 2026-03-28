import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
	activityLevelValidator,
	dealActivityStreamValidator,
	dealIndustryValidator,
	dealInsightKindValidator,
	dealNewsSourceValidator,
	dealStageValidator,
	orgChartNodeRecordValidator
} from './validators';

const activityMarkerValidator = v.union(
	v.object({
		kind: v.literal('dot')
	}),
	v.object({
		kind: v.literal('broker-avatar'),
		brokerId: v.id('brokers')
	})
);

const activityDocumentValidator = v.union(
	v.object({
		kind: v.literal('headline'),
		dealId: v.id('deals'),
		meetingId: v.optional(v.id('meetings')),
		stream: dealActivityStreamValidator,
		occurredOnIso: v.string(),
		body: v.string(),
		marker: activityMarkerValidator,
		title: v.string()
	}),
	v.object({
		kind: v.literal('actor-action'),
		dealId: v.id('deals'),
		meetingId: v.optional(v.id('meetings')),
		stream: dealActivityStreamValidator,
		occurredOnIso: v.string(),
		body: v.string(),
		marker: activityMarkerValidator,
		actorBrokerId: v.id('brokers'),
		action: v.string()
	})
);

const embeddedActivityValidator = v.union(
	v.object({
		kind: v.literal('headline'),
		id: v.string(),
		dealId: v.id('deals'),
		stream: dealActivityStreamValidator,
		occurredOnIso: v.string(),
		body: v.string(),
		marker: activityMarkerValidator,
		title: v.string()
	}),
	v.object({
		kind: v.literal('actor-action'),
		id: v.string(),
		dealId: v.id('deals'),
		stream: dealActivityStreamValidator,
		occurredOnIso: v.string(),
		body: v.string(),
		marker: activityMarkerValidator,
		actorBrokerId: v.id('brokers'),
		action: v.string()
	})
);

const helpfulContactValidator = v.object({
	id: v.string(),
	name: v.string(),
	title: v.string(),
	company: v.string(),
	linkedInUrl: v.string()
});

const flatDealContextValidator = v.object({
	summary: v.string(),
	claimedAtIso: v.string(),
	orgChartNodes: v.array(orgChartNodeRecordValidator),
	helpfulContacts: v.optional(v.array(helpfulContactValidator))
});

// Accept legacy nested org charts so existing deployments can still boot after the shape change.
const legacyDealContextValidator = v.object({
	summary: v.string(),
	claimedAtIso: v.string(),
	orgChartRoot: v.any(),
	helpfulContacts: v.optional(v.array(helpfulContactValidator))
});

const dealContextValidator = v.union(flatDealContextValidator, legacyDealContextValidator);

const flatInsightValidator = v.object({
	dealId: v.id('deals'),
	meetingId: v.id('meetings'),
	kind: dealInsightKindValidator,
	title: v.string(),
	ownerBrokerId: v.id('brokers'),
	collaboratorBrokerIds: v.array(v.id('brokers')),
	timeline: v.array(embeddedActivityValidator),
	orgChartNodes: v.array(orgChartNodeRecordValidator)
});

const legacyInsightValidator = v.object({
	dealId: v.id('deals'),
	meetingId: v.id('meetings'),
	kind: dealInsightKindValidator,
	title: v.string(),
	ownerBrokerId: v.id('brokers'),
	collaboratorBrokerIds: v.array(v.id('brokers')),
	timeline: v.array(embeddedActivityValidator),
	orgChartRoot: v.any()
});

const insightDocumentValidator = v.union(flatInsightValidator, legacyInsightValidator);

export default defineSchema({
	meetings: defineTable({
		dateIso: v.string()
	}).index('by_date_iso', ['dateIso']),

	brokers: defineTable({
		name: v.string(),
		avatar: v.string()
	}),

	deals: defineTable({
		dealNumber: v.number(),
		industry: dealIndustryValidator,
		dealName: v.string(),
		isReservedInEpic: v.boolean(),
		probability: v.number(),
		stage: dealStageValidator,
		isLikelyOutOfDate: v.boolean(),
		activityLevel: activityLevelValidator,
		lastActivityAtIso: v.optional(v.string()),
		ownerBrokerId: v.optional(v.id('brokers')),
		collaboratorBrokerIds: v.array(v.id('brokers')),
		context: v.optional(dealContextValidator),
		dashboardFlags: v.object({
			needsSupport: v.boolean(),
			duplicatedWork: v.boolean()
		})
	}),

	activities: defineTable(activityDocumentValidator)
		.index('by_stream_occurred_on_iso', ['stream', 'occurredOnIso'])
		.index('by_meeting_id_stream_occurred_on_iso', ['meetingId', 'stream', 'occurredOnIso'])
		.index('by_deal_id_stream_occurred_on_iso', ['dealId', 'stream', 'occurredOnIso']),

	news: defineTable({
		dealId: v.id('deals'),
		title: v.string(),
		source: dealNewsSourceValidator,
		publishedOnIso: v.string()
	})
		.index('by_published_on_iso', ['publishedOnIso'])
		.index('by_deal_id_published_on_iso', ['dealId', 'publishedOnIso']),

	insights: defineTable(insightDocumentValidator)
		.index('by_deal_id', ['dealId'])
		.index('by_kind', ['kind'])
		.index('by_meeting_id', ['meetingId'])
		.index('by_meeting_id_kind', ['meetingId', 'kind'])
		.index('by_deal_id_kind', ['dealId', 'kind'])
});
