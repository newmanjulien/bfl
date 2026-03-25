import type { ActivityLevel } from '$lib/domain/activity-level';
import type { ActivityTrendChartData } from '$lib/domain/activity-trend';
import type { IsoDateTimeString } from '$lib/domain/date-time';
import type { PersonSummary } from '$lib/domain/people';

export type DetailRightRailMetadata = {
	deal: string;
	dealNumber?: number;
	activityLevel: ActivityLevel;
	owner: PersonSummary | null;
	stage: string;
};

export type DetailRightRailLimitation = 'missing-detail-context';

export type DealDetailRightRailData = {
	kind: 'deal';
	metadata: DetailRightRailMetadata;
	timing: {
		claimedAtIso: IsoDateTimeString;
		lastActivityAtIso: IsoDateTimeString | null;
	};
	activityTrend: ActivityTrendChartData;
};

export type MetadataDetailRightRailData = {
	kind: 'metadata';
	metadata: DetailRightRailMetadata;
	limitation?: DetailRightRailLimitation;
};

export type DetailRightRailData = DealDetailRightRailData | MetadataDetailRightRailData;
