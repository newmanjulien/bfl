import type { QueryCtx } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import type { OrgChartNodeRecord } from '../lib/domain/org-chart';
import {
	parseIsoDate,
	parseIsoDateTime,
	parseOptionalIsoDateTime,
	type IsoDate,
	type IsoDateTime
} from '../lib/types/dates';
import type { BrokerId, DealId, InsightId, MeetingId } from '../lib/types/ids';
import type {
	ActivityLevel,
	DealActivityStream,
	DealIndustry,
	DealInsightKind,
	DealNewsSource,
	DealStage
} from '../lib/types/vocab';
import type { DashboardMeeting, DashboardPerson } from './validators';

export type DealContextRecordData = {
	summary: string;
	claimedAtIso: IsoDateTime;
	orgChartNodes: OrgChartNodeRecord[];
	helpfulContacts?: {
		id: string;
		name: string;
		title: string;
		company: string;
		linkedInUrl: string;
	}[];
};

export type DealRecordData = {
	id: DealId;
	dealNumber: number;
	industry: DealIndustry;
	dealName: string;
	isReservedInEpic: boolean;
	probability: number;
	stage: DealStage;
	isLikelyOutOfDate: boolean;
	activityLevel: ActivityLevel;
	lastActivityAtIso?: IsoDateTime;
	ownerBrokerId: BrokerId | null;
	collaboratorBrokerIds: BrokerId[];
	context?: DealContextRecordData;
	dashboardFlags: {
		needsSupport: boolean;
		duplicatedWork: boolean;
	};
};

type ActivityMarkerData<BrokerIdValue extends string = BrokerId> =
	| {
			kind: 'dot';
	  }
	| {
			kind: 'broker-avatar';
			brokerId: BrokerIdValue;
	  };

export type ActivityRecordData<BrokerIdValue extends string = BrokerId> =
	| {
			kind: 'headline';
			id: string;
			dealId: DealId;
			stream: DealActivityStream;
			occurredOnIso: IsoDate;
			body: string;
			marker: ActivityMarkerData<BrokerIdValue>;
			title: string;
	  }
	| {
			kind: 'actor-action';
			id: string;
			dealId: DealId;
			stream: DealActivityStream;
			occurredOnIso: IsoDate;
			body: string;
			marker: ActivityMarkerData<BrokerIdValue>;
			actorBrokerId: BrokerIdValue;
			action: string;
	  };

export type NewsRecordData = {
	id: string;
	dealId: DealId;
	title: string;
	source: DealNewsSource;
	publishedOnIso: IsoDate;
};

export type InsightRecordData = {
	id: InsightId;
	dealId: DealId;
	meetingId: MeetingId;
	kind: DealInsightKind;
	title: string;
	ownerBrokerId: BrokerId;
	collaboratorBrokerIds: BrokerId[];
	timeline: ActivityRecordData[];
	orgChartNodes: OrgChartNodeRecord[];
};

type DashboardActivityValue = Doc<'activities'> | Doc<'insights'>['timeline'][number];
export type MeetingRecordData = DashboardMeeting;

type DealContextDocument = NonNullable<Doc<'deals'>['context']>;
type InsightDocument = Doc<'insights'>;

export function toMeetingRecord(meeting: Doc<'meetings'>): MeetingRecordData {
	return {
		id: meeting._id,
		dateIso: parseIsoDate(meeting.dateIso, `meetings["${meeting._id}"].dateIso`)
	};
}

export async function listMeetingRecords(ctx: QueryCtx): Promise<MeetingRecordData[]> {
	const meetings = await ctx.db.query('meetings').collect();

	return meetings
		.map((meeting) => toMeetingRecord(meeting))
		.sort((left, right) => right.dateIso.localeCompare(left.dateIso));
}

export async function requireMeetingRecord(
	ctx: QueryCtx,
	meetingId: MeetingId
): Promise<MeetingRecordData> {
	const meeting = await ctx.db.get(meetingId);

	if (!meeting) {
		throw new Error(`Unknown meeting "${meetingId}".`);
	}

	return toMeetingRecord(meeting);
}

async function resolveBrokerAvatar(
	ctx: QueryCtx,
	broker: Doc<'brokers'>
): Promise<DashboardPerson['avatar']> {
	try {
		const avatarUrl = await ctx.storage.getUrl(broker.avatar as Id<'_storage'>);

		return avatarUrl ?? broker.avatar;
	} catch {
		return broker.avatar;
	}
}

export async function toDashboardPerson(
	ctx: QueryCtx,
	broker: Doc<'brokers'>
): Promise<DashboardPerson> {
	return {
		id: broker._id,
		name: broker.name,
		avatar: await resolveBrokerAvatar(ctx, broker)
	};
}

export function toDashboardPeople(
	ctx: QueryCtx,
	brokers: readonly Doc<'brokers'>[]
): Promise<DashboardPerson[]> {
	return Promise.all(brokers.map((broker) => toDashboardPerson(ctx, broker)));
}

function toOrgChartNodeRecord(
	node: DealContextDocument['orgChartNodes'][number] | InsightDocument['orgChartNodes'][number]
): OrgChartNodeRecord {
	return {
		id: node.id,
		name: node.name,
		role: node.role,
		lastContactedByBrokerId: node.lastContactedByBrokerId,
		lastContactedOnIso: parseIsoDate(node.lastContactedOnIso, `orgChartNodes["${node.id}"].lastContactedOnIso`),
		parentId: node.parentId ?? undefined
	};
}

export function toDealContextRecord(context: DealContextDocument): DealContextRecordData {
	return {
		summary: context.summary,
		claimedAtIso: parseIsoDateTime(context.claimedAtIso, 'deal.context.claimedAtIso'),
		orgChartNodes: context.orgChartNodes.map((node) => toOrgChartNodeRecord(node)),
		helpfulContacts: context.helpfulContacts?.map((contact) => ({
			id: contact.id,
			name: contact.name,
			title: contact.title,
			company: contact.company,
			linkedInUrl: contact.linkedInUrl
		}))
	};
}

export function toDealRecord(deal: Doc<'deals'>): DealRecordData {
	return {
		id: deal._id,
		dealNumber: deal.dealNumber,
		industry: deal.industry as DealIndustry,
		dealName: deal.dealName,
		isReservedInEpic: deal.isReservedInEpic,
		probability: deal.probability,
		stage: deal.stage as DealStage,
		isLikelyOutOfDate: deal.isLikelyOutOfDate,
		activityLevel: deal.activityLevel as ActivityLevel,
		lastActivityAtIso: parseOptionalIsoDateTime(
			deal.lastActivityAtIso,
			`deals["${deal._id}"].lastActivityAtIso`
		),
		ownerBrokerId: deal.ownerBrokerId ?? null,
		collaboratorBrokerIds: deal.collaboratorBrokerIds,
		context: deal.context ? toDealContextRecord(deal.context) : undefined,
		dashboardFlags: {
			needsSupport: deal.dashboardFlags.needsSupport,
			duplicatedWork: deal.dashboardFlags.duplicatedWork
		}
	};
}

export function toActivityRecord(activity: DashboardActivityValue): ActivityRecordData {
	const id = 'id' in activity ? activity.id : String(activity._id);
	const marker =
		activity.marker.kind === 'dot'
			? { kind: 'dot' as const }
			: { kind: 'broker-avatar' as const, brokerId: activity.marker.brokerId };

	if (activity.kind === 'headline') {
			return {
				kind: 'headline',
				id,
				dealId: activity.dealId,
				stream: activity.stream as DealActivityStream,
				occurredOnIso: parseIsoDate(activity.occurredOnIso, `activity["${id}"].occurredOnIso`),
				body: activity.body,
				marker,
				title: activity.title
		};
	}

	return {
		kind: 'actor-action',
		id,
		dealId: activity.dealId,
		stream: activity.stream as DealActivityStream,
		occurredOnIso: parseIsoDate(activity.occurredOnIso, `activity["${id}"].occurredOnIso`),
		body: activity.body,
		marker,
		actorBrokerId: activity.actorBrokerId,
		action: activity.action
	};
}

export function toNewsRecord(newsItem: Doc<'news'>): NewsRecordData {
	return {
		id: String(newsItem._id),
		dealId: newsItem.dealId,
		title: newsItem.title,
		source: newsItem.source as DealNewsSource,
		publishedOnIso: parseIsoDate(newsItem.publishedOnIso, `news["${newsItem._id}"].publishedOnIso`)
	};
}

export function toInsightRecord(insight: InsightDocument): InsightRecordData {
	return {
		id: insight._id,
		dealId: insight.dealId,
		meetingId: insight.meetingId,
		kind: insight.kind as DealInsightKind,
		title: insight.title,
		ownerBrokerId: insight.ownerBrokerId,
		collaboratorBrokerIds: insight.collaboratorBrokerIds,
		timeline: insight.timeline.map((activity) => toActivityRecord(activity)),
		orgChartNodes: insight.orgChartNodes.map((node) => toOrgChartNodeRecord(node))
	};
}
