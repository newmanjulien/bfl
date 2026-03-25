import type { ActivityLevel } from '$lib/domain/activity-level';
import type { ActivityTrendChartData } from '$lib/domain/activity-trend';
import type { IsoDateString, IsoDateTimeString } from '$lib/domain/date-time';
import type { OrgChartContactNode } from '$lib/domain/org-chart';

export const DEAL_STAGES = [
	'Discovery',
	'Proposal',
	'Negotiation',
	'Closed won',
	'Closed lost'
] as const;

export type DealStage = (typeof DEAL_STAGES)[number];

export type DealRecord = {
	dealId: string;
	dealNumber: number;
	accountName: string;
	dealName: string;
	probability: number;
	stage: DealStage;
	activityTrend?: ActivityTrendChartData;
	lastActivityAtIso?: IsoDateTimeString;
};

export type DealSnapshot = Pick<
	DealRecord,
	'dealId' | 'dealName' | 'probability' | 'stage'
>;

export type DealBrokerRelationship = 'owner' | 'member';

export type DealBrokerLinkRecord<BrokerId extends string = string> = {
	id: string;
	dealId: string;
	brokerId: BrokerId;
	relationship: DealBrokerRelationship;
};

export type DealActivityStream = 'deal-detail' | 'meeting-update';

export type DealActivityMarkerRecord<BrokerId extends string = string> =
	| {
			kind: 'dot';
	  }
	| {
			kind: 'broker-avatar';
			brokerId: BrokerId;
	  };

type DealActivityRecordBase<BrokerId extends string = string> = {
	id: string;
	dealId: string;
	stream: DealActivityStream;
	occurredOnIso: IsoDateString;
	body: string;
	marker: DealActivityMarkerRecord<BrokerId>;
};

export type DealActivityRecord<BrokerId extends string = string> =
	| (DealActivityRecordBase<BrokerId> & {
			kind: 'headline';
			title: string;
	  })
	| (DealActivityRecordBase<BrokerId> & {
			kind: 'actor-action';
			actorBrokerId: BrokerId;
			action: string;
	  });

export type DealNewsSource = 'news' | 'linkedin';

export type DealNewsRecord = {
	id: string;
	dealId: string;
	title: string;
	description: string;
	source: DealNewsSource;
	publishedOnIso: IsoDateString;
};

export type DealInsightKind = 'opportunity' | 'risk';

export type DealInsightRecord<BrokerId extends string = string> = {
	id: string;
	dealId: string;
	kind: DealInsightKind;
	title: string;
	summary: string;
	activityLevel: ActivityLevel;
	ownerBrokerIds: readonly [BrokerId, ...BrokerId[]];
	timeline: readonly DealActivityRecord<BrokerId>[];
	orgChartRoot: OrgChartContactNode<BrokerId>;
};

export type DealForecastRecord = {
	id: string;
	dealId: string;
	overbaseProbability: number;
	description: string;
};

export type DealContextRecord<ContactById extends string = string> = {
	dealId: string;
	summary: string;
	claimedAtIso: IsoDateTimeString;
	orgChartRoot: OrgChartContactNode<ContactById>;
};
