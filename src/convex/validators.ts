import { v } from 'convex/values';
import {
	type AllActivityView,
	ALL_ACTIVITY_NON_DEFAULT_VIEWS,
	DEFAULT_ALL_ACTIVITY_VIEW
} from '../lib/dashboard/routing/all-activity';
import {
	DEFAULT_MY_DEALS_VIEW,
	MY_DEALS_DETAIL_TAB_IDS,
	MY_DEALS_NON_DEFAULT_VIEWS,
	type MyDealsDetailTabId,
	type MyDealsView
} from '../lib/dashboard/routing/my-deals';
import type { DetailRightRailData } from '../lib/dashboard/detail/right-rail';
import type { OrgChartNodeRecord as SharedOrgChartNodeRecord } from '../lib/domain/org-chart';
import type { CanvasHeroData } from '../lib/dashboard/ui/detail/CanvasHero.types';
import type { FileUploadFieldData } from '../lib/dashboard/ui/detail/FileUploadField.types';
import type { DealSummaryRow } from '../lib/dashboard/view-models/deal';
import type { TimelineItem } from '../lib/dashboard/view-models/deal-content';
import type { IsoDate, IsoDateTime } from '../lib/types/dates';
import type { BrokerId, DealId, InsightId } from '../lib/types/ids';
import {
	ACTIVITY_LEVELS,
	DEAL_ACTIVITY_STREAMS,
	DEAL_INDUSTRIES,
	DEAL_INSIGHT_KINDS,
	DEAL_NEWS_SOURCES,
	DEAL_STAGES,
	type ActivityLevel,
	type DealIndustry,
	type DealInsightKind,
	type DealNewsSource
} from '../lib/types/vocab';

type NonEmptyStringTuple = readonly [string, ...string[]];

export function literalUnion<const Values extends NonEmptyStringTuple>(values: Values) {
	const [first, ...rest] = values;

	return v.union(v.literal(first), ...rest.map((value) => v.literal(value)));
}

export const activityLevelValidator = literalUnion(ACTIVITY_LEVELS);
export const dealStageValidator = literalUnion(DEAL_STAGES);
export const dealIndustryValidator = literalUnion(DEAL_INDUSTRIES);
export const dealActivityStreamValidator = literalUnion(DEAL_ACTIVITY_STREAMS);
export const dealNewsSourceValidator = literalUnion(DEAL_NEWS_SOURCES);
export const dealInsightKindValidator = literalUnion(DEAL_INSIGHT_KINDS);

export const allActivityViewValidator = literalUnion([
	DEFAULT_ALL_ACTIVITY_VIEW,
	...ALL_ACTIVITY_NON_DEFAULT_VIEWS
] as const);
export const myDealsViewValidator = literalUnion([
	DEFAULT_MY_DEALS_VIEW,
	...MY_DEALS_NON_DEFAULT_VIEWS
] as const);
export const myDealsDetailTabIdValidator = literalUnion(MY_DEALS_DETAIL_TAB_IDS);

export type AllActivityViewValue = AllActivityView;
export type MyDealsViewValue = MyDealsView;
export type MyDealsDetailTabIdValue = MyDealsDetailTabId;

export const dashboardPersonValidator = v.object({
	id: v.id('brokers'),
	legacyId: v.string(),
	name: v.string(),
	avatar: v.string()
});

export type DashboardPerson = {
	id: BrokerId;
	legacyId: string;
	name: string;
	avatar: string;
};

export const myDealsDetailRefValidator = v.object({
	dealId: v.id('deals'),
	defaultTab: myDealsDetailTabIdValidator
});

export const allActivityDetailRefValidator = v.object({
	dealId: v.id('deals')
});

export const opportunityDetailRefValidator = v.object({
	insightId: v.id('insights')
});

export const canvasHeroValidator = v.object({
	title: v.string(),
	description: v.optional(v.string()),
	dealNumber: v.optional(v.number())
});

export const fileUploadFieldValidator = v.object({
	sectionId: v.string(),
	uploadLabel: v.optional(v.string()),
	uploadDescription: v.optional(v.string()),
	acceptedFileTypes: v.optional(v.string()),
	allowMultipleFiles: v.optional(v.boolean())
});

export const timelineMarkerValidator = v.union(
	v.object({
		kind: v.literal('dot')
	}),
	v.object({
		kind: v.literal('avatar'),
		person: dashboardPersonValidator
	})
);

export const timelineItemValidator = v.union(
	v.object({
		kind: v.literal('headline'),
		id: v.string(),
		occurredOnIso: v.string(),
		body: v.string(),
		marker: timelineMarkerValidator,
		title: v.string()
	}),
	v.object({
		kind: v.literal('actor-action'),
		id: v.string(),
		occurredOnIso: v.string(),
		body: v.string(),
		marker: timelineMarkerValidator,
		actor: dashboardPersonValidator,
		action: v.string()
	})
);

export type TimelineItemData = TimelineItem;

export const dealSummaryRowValidator = v.object({
	id: v.string(),
	deal: v.string(),
	probability: v.number(),
	activityLevel: activityLevelValidator,
	stage: v.string()
});

export const orgChartNodeRecordValidator = v.object({
	id: v.string(),
	name: v.string(),
	role: v.string(),
	lastContactedByBrokerId: v.id('brokers'),
	lastContactedOnIso: v.string(),
	parentId: v.optional(v.string())
});

export type OrgChartNodeRecord = SharedOrgChartNodeRecord<BrokerId>;

export const detailRightRailRowValidator = v.union(
	v.object({
		id: v.string(),
		label: v.string(),
		kind: v.literal('text'),
		value: v.string()
	}),
	v.object({
		id: v.string(),
		label: v.string(),
		kind: v.literal('industry'),
		value: dealIndustryValidator,
		dealId: v.id('deals')
	}),
	v.object({
		id: v.string(),
		label: v.string(),
		kind: v.literal('deal-number'),
		dealNumber: v.number()
	}),
	v.object({
		id: v.string(),
		label: v.string(),
		kind: v.literal('activity-level'),
		activityLevel: activityLevelValidator
	}),
	v.object({
		id: v.string(),
		label: v.string(),
		kind: v.literal('person'),
		person: v.union(dashboardPersonValidator, v.null()),
		emptyValue: v.optional(v.string())
	})
);

export const detailRightRailHelpfulContactValidator = v.object({
	id: v.string(),
	name: v.string(),
	title: v.string(),
	company: v.string(),
	linkedInUrl: v.string()
});

export const detailRightRailSectionValidator = v.union(
	v.object({
		id: v.string(),
		kind: v.literal('rows'),
		rows: v.array(detailRightRailRowValidator)
	}),
	v.object({
		id: v.string(),
		kind: v.literal('helpful-contacts'),
		title: v.string(),
		contacts: v.array(detailRightRailHelpfulContactValidator)
	})
);

export const detailRightRailDataValidator = v.object({
	sections: v.array(detailRightRailSectionValidator)
});

export const myDealsFeedItemReadModelValidator = v.union(
	v.object({
		id: v.string(),
		title: v.string(),
		kind: v.literal('news'),
		dateIso: v.string()
	}),
	v.object({
		id: v.string(),
		title: v.string(),
		kind: v.literal('linkedin'),
		dateIso: v.string()
	}),
	v.object({
		id: v.string(),
		title: v.string(),
		kind: v.literal('activity'),
		dateIso: v.string(),
		detail: myDealsDetailRefValidator
	})
);

export const myDealsTableRowReadModelValidator = v.object({
	id: v.id('deals'),
	detail: v.union(myDealsDetailRefValidator, v.null()),
	deal: v.string(),
	latestNewsSource: v.union(dealNewsSourceValidator, v.null()),
	latestNews: v.string(),
	lastActivityDescription: v.string(),
	owner: v.union(dashboardPersonValidator, v.null()),
	isReservedInEpic: v.boolean()
});

export const allActivityRowLastActivityValidator = v.union(
	v.object({
		kind: v.literal('relative'),
		atIso: v.string()
	}),
	v.object({
		kind: v.literal('text'),
		label: v.string()
	})
);

export const allActivityTableRowReadModelValidator = v.object({
	id: v.id('deals'),
	detail: v.union(allActivityDetailRefValidator, v.null()),
	probability: v.number(),
	activityLevel: activityLevelValidator,
	deal: v.string(),
	stage: v.string(),
	lastActivity: allActivityRowLastActivityValidator,
	owner: v.union(dashboardPersonValidator, v.null())
});

export const allActivityFilterDrawerDataValidator = v.object({
	brokers: v.array(dashboardPersonValidator),
	activityLevels: v.array(
		v.object({
			id: activityLevelValidator,
			label: v.string()
		})
	),
	industries: v.array(
		v.object({
			id: dealIndustryValidator,
			label: v.string()
		})
	)
});

export const opportunityTileReadModelValidator = v.object({
	id: v.id('insights'),
	detail: opportunityDetailRefValidator,
	title: v.string(),
	dealNumber: v.number(),
	dealLabel: v.optional(v.string()),
	avatars: v.optional(v.array(v.string())),
	activityLevel: activityLevelValidator
});

export const dashboardShellResultValidator = v.object({
	people: v.array(dashboardPersonValidator),
	meetingDateIsos: v.array(v.string()),
	activeMeetingDateIso: v.string()
});

export const myDealsListReadModelValidator = v.object({
	rows: v.array(myDealsTableRowReadModelValidator),
	newsItems: v.array(myDealsFeedItemReadModelValidator),
	watchlistItems: v.array(myDealsFeedItemReadModelValidator)
});

export const myDealsDetailReadModelValidator = v.object({
	title: v.string(),
	hero: canvasHeroValidator,
	newsItems: v.array(myDealsFeedItemReadModelValidator),
	activityItems: v.array(timelineItemValidator),
	update: fileUploadFieldValidator,
	rightRail: detailRightRailDataValidator
});

export const allActivityListReadModelValidator = v.object({
	rows: v.array(allActivityTableRowReadModelValidator),
	filterDrawerData: allActivityFilterDrawerDataValidator
});

export const allActivityDetailReadModelValidator = v.object({
	title: v.string(),
	hero: canvasHeroValidator,
	activityItems: v.array(timelineItemValidator),
	orgChartNodes: v.array(orgChartNodeRecordValidator),
	update: fileUploadFieldValidator,
	rightRail: detailRightRailDataValidator
});

export const opportunitiesListReadModelValidator = v.object({
	opportunityTiles: v.array(opportunityTileReadModelValidator),
	riskTiles: v.array(opportunityTileReadModelValidator),
	update: fileUploadFieldValidator
});

export const opportunityDetailReadModelValidator = v.object({
	title: v.string(),
	hero: canvasHeroValidator,
	kind: dealInsightKindValidator,
	activityItems: v.array(timelineItemValidator),
	orgChartNodes: v.array(orgChartNodeRecordValidator),
	update: fileUploadFieldValidator,
	rightRail: detailRightRailDataValidator
});

export const sinceLastMeetingReadModelValidator = v.object({
	referenceMeetingDateIso: v.string(),
	timelineItems: v.array(timelineItemValidator),
	deals: v.array(dealSummaryRowValidator),
	update: fileUploadFieldValidator
});

export type MyDealsDetailRef = {
	dealId: DealId;
	defaultTab: MyDealsDetailTabId;
};

export type AllActivityDetailRef = {
	dealId: DealId;
};

export type OpportunityDetailRef = {
	insightId: InsightId;
};

export type MyDealsFeedItemReadModel =
	| {
			id: string;
			title: string;
			kind: 'news';
			dateIso: IsoDate;
	  }
	| {
			id: string;
			title: string;
			kind: 'linkedin';
			dateIso: IsoDate;
	  }
	| {
			id: string;
			title: string;
			kind: 'activity';
			dateIso: IsoDate;
			detail: MyDealsDetailRef;
	  };

export type MyDealsTableRowReadModel = {
	id: DealId;
	detail: MyDealsDetailRef | null;
	deal: string;
	latestNewsSource: DealNewsSource | null;
	latestNews: string;
	lastActivityDescription: string;
	owner: DashboardPerson | null;
	isReservedInEpic: boolean;
};

export type AllActivityTableRowReadModel = {
	id: DealId;
	detail: AllActivityDetailRef | null;
	probability: number;
	activityLevel: ActivityLevel;
	deal: string;
	stage: string;
	lastActivity:
		| {
				kind: 'relative';
				atIso: IsoDateTime;
		  }
		| {
				kind: 'text';
				label: string;
		  };
	owner: DashboardPerson | null;
};

export type AllActivityFilterDrawerData = {
	brokers: DashboardPerson[];
	activityLevels: {
		id: ActivityLevel;
		label: string;
	}[];
	industries: {
		id: DealIndustry;
		label: string;
	}[];
};

export type OpportunityTileReadModel = {
	id: InsightId;
	detail: OpportunityDetailRef;
	title: string;
	dealNumber: number;
	dealLabel?: string;
	avatars?: string[];
	activityLevel: ActivityLevel;
};

export type DashboardShellReadModel = {
	people: DashboardPerson[];
	meetingDateIsos: IsoDate[];
	activeMeetingDateIso: IsoDate;
};

export type MyDealsListReadModel = {
	rows: MyDealsTableRowReadModel[];
	newsItems: MyDealsFeedItemReadModel[];
	watchlistItems: MyDealsFeedItemReadModel[];
};

export type MyDealsDetailReadModel = {
	title: string;
	hero: CanvasHeroData;
	newsItems: MyDealsFeedItemReadModel[];
	activityItems: TimelineItem[];
	update: FileUploadFieldData;
	rightRail: DetailRightRailData;
};

export type AllActivityListReadModel = {
	rows: AllActivityTableRowReadModel[];
	filterDrawerData: AllActivityFilterDrawerData;
};

export type AllActivityDetailReadModel = {
	title: string;
	hero: CanvasHeroData;
	activityItems: TimelineItem[];
	orgChartNodes: OrgChartNodeRecord[];
	update: FileUploadFieldData;
	rightRail: DetailRightRailData;
};

export type OpportunitiesListReadModel = {
	opportunityTiles: OpportunityTileReadModel[];
	riskTiles: OpportunityTileReadModel[];
	update: FileUploadFieldData;
};

export type OpportunityDetailReadModel = {
	title: string;
	hero: CanvasHeroData;
	kind: DealInsightKind;
	activityItems: TimelineItem[];
	orgChartNodes: OrgChartNodeRecord[];
	update: FileUploadFieldData;
	rightRail: DetailRightRailData;
};

export type SinceLastMeetingReadModel = {
	referenceMeetingDateIso: IsoDate;
	timelineItems: TimelineItem[];
	deals: DealSummaryRow[];
	update: FileUploadFieldData;
};
