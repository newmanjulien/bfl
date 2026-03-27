import type { QueryCtx } from './_generated/server';
import type { Doc } from './_generated/dataModel';
import type { OrgChartNodeRecord } from '../lib/domain/org-chart';
import {
	parseIsoDate,
	parseIsoDateArray,
	parseIsoDateTime,
	parseOptionalIsoDateTime,
	type IsoDate,
	type IsoDateTime
} from '../lib/types/dates';
import type { BrokerId, DealId, InsightId } from '../lib/types/ids';
import type {
	ActivityLevel,
	DealActivityStream,
	DealIndustry,
	DealInsightKind,
	DealNewsSource,
	DealStage
} from '../lib/types/vocab';
import type { DashboardPerson } from './validators';

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
	accountName: string;
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
	kind: DealInsightKind;
	title: string;
	ownerBrokerId: BrokerId;
	collaboratorBrokerIds: BrokerId[];
	timeline: ActivityRecordData[];
	orgChartNodes: OrgChartNodeRecord[];
};

type DashboardActivityValue = Doc<'activities'> | Doc<'insights'>['timeline'][number];

export type MeetingScheduleRecordData = {
	meetingDateIsos: IsoDate[];
	activeMeetingDateIso: IsoDate;
};

type DealContextDocument = NonNullable<Doc<'deals'>['context']>;
type FlatDealContextDocument = Extract<DealContextDocument, { orgChartNodes: unknown[] }>;
type InsightDocument = Doc<'insights'>;
type FlatInsightDocument = Extract<InsightDocument, { orgChartNodes: unknown[] }>;

export async function requireMeetingScheduleDocument(
	ctx: QueryCtx
): Promise<MeetingScheduleRecordData> {
	const meetingSchedule = await ctx.db
		.query('meetingSchedule')
		.withIndex('by_key', (query) => query.eq('key', 'default'))
		.first();

	if (!meetingSchedule) {
		throw new Error('Missing meeting schedule document "default".');
	}

	return {
		meetingDateIsos: parseIsoDateArray(meetingSchedule.meetingDateIsos, 'meetingSchedule.meetingDateIsos'),
		activeMeetingDateIso: parseIsoDate(
			meetingSchedule.activeMeetingDateIso,
			'meetingSchedule.activeMeetingDateIso'
		)
	};
}

export function toDashboardPerson(broker: Doc<'brokers'>): DashboardPerson {
	return {
		id: broker._id,
		legacyId: broker.legacyId,
		name: broker.name,
		avatar: broker.avatar
	};
}

function requireString(value: unknown, path: string) {
	if (typeof value !== 'string') {
		throw new Error(`Expected string at "${path}".`);
	}

	return value;
}

function toOrgChartNodeRecord(
	node:
		| FlatDealContextDocument['orgChartNodes'][number]
		| FlatInsightDocument['orgChartNodes'][number]
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

function toLegacyOrgChartNodeRecords(
	node: unknown,
	path: string,
	parentId?: string
): OrgChartNodeRecord[] {
	if (!node || typeof node !== 'object' || Array.isArray(node)) {
		throw new Error(`Invalid legacy org chart node at "${path}".`);
	}

	const rawNode = node as Record<string, unknown>;
	const id = requireString(rawNode.id, `${path}.id`);
	const directReports = rawNode.directReports;

	if (directReports !== undefined && !Array.isArray(directReports)) {
		throw new Error(`Invalid legacy org chart directReports at "${path}.directReports".`);
	}

	const currentNode: OrgChartNodeRecord = {
		id,
		name: requireString(rawNode.name, `${path}.name`),
		role: requireString(rawNode.role, `${path}.role`),
		lastContactedByBrokerId: requireString(
			rawNode.lastContactedByBrokerId,
			`${path}.lastContactedByBrokerId`
		) as BrokerId,
		lastContactedOnIso: parseIsoDate(
			requireString(rawNode.lastContactedOnIso, `${path}.lastContactedOnIso`),
			`${path}.lastContactedOnIso`
		),
		parentId
	};

	return [
		currentNode,
		...(directReports ?? []).flatMap((childNode, index) =>
			toLegacyOrgChartNodeRecords(childNode, `${path}.directReports[${index}]`, id)
		)
	];
}

function hasFlatOrgChartNodes(context: DealContextDocument): context is FlatDealContextDocument {
	return 'orgChartNodes' in context;
}

function hasFlatInsightOrgChartNodes(insight: InsightDocument): insight is FlatInsightDocument {
	return 'orgChartNodes' in insight;
}

export function toDealContextRecord(context: DealContextDocument): DealContextRecordData {
	return {
		summary: context.summary,
		claimedAtIso: parseIsoDateTime(context.claimedAtIso, 'deal.context.claimedAtIso'),
		orgChartNodes: hasFlatOrgChartNodes(context)
			? context.orgChartNodes.map((node) => toOrgChartNodeRecord(node))
			: toLegacyOrgChartNodeRecords(context.orgChartRoot, 'deal.context.orgChartRoot'),
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
		accountName: deal.accountName,
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
		kind: insight.kind as DealInsightKind,
		title: insight.title,
		ownerBrokerId: insight.ownerBrokerId,
		collaboratorBrokerIds: insight.collaboratorBrokerIds,
		timeline: insight.timeline.map((activity) => toActivityRecord(activity)),
		orgChartNodes: hasFlatInsightOrgChartNodes(insight)
			? insight.orgChartNodes.map((node) => toOrgChartNodeRecord(node))
			: toLegacyOrgChartNodeRecords(insight.orgChartRoot, `insights["${insight._id}"].orgChartRoot`)
	};
}
