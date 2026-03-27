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
import type {
	AllActivityDetailRouteRef,
	InternalLink,
	MyDealsDetailRouteRef,
	Navigation,
	OpportunitiesDetailRouteRef
} from '../lib/dashboard/routing';
import type { DetailRightRailData } from '../lib/dashboard/detail/right-rail';
import type { OrgChartNodeRecord as SharedOrgChartNodeRecord } from '../lib/domain/org-chart';
import type { DashboardHeader } from '../lib/dashboard/shell/header/types';
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

export const myDealsListRouteRefValidator = v.object({
	kind: v.literal('my-deals-list'),
	view: myDealsViewValidator
});

export const myDealsDetailRouteRefValidator = v.object({
	kind: v.literal('my-deals-detail'),
	dealId: v.id('deals'),
	view: myDealsViewValidator,
	tab: myDealsDetailTabIdValidator
});

export const allActivityListRouteRefValidator = v.object({
	kind: v.literal('all-activity-list'),
	view: allActivityViewValidator
});

export const allActivityDetailRouteRefValidator = v.object({
	kind: v.literal('all-activity-detail'),
	dealId: v.id('deals'),
	view: allActivityViewValidator
});

export const opportunitiesListRouteRefValidator = v.object({
	kind: v.literal('opportunities-list')
});

export const opportunitiesDetailRouteRefValidator = v.object({
	kind: v.literal('opportunities-detail'),
	insightId: v.id('insights')
});

export const sinceLastMeetingRouteRefValidator = v.object({
	kind: v.literal('since-last-meeting')
});

export const dashboardRouteRefValidator = v.union(
	myDealsListRouteRefValidator,
	myDealsDetailRouteRefValidator,
	allActivityListRouteRefValidator,
	allActivityDetailRouteRefValidator,
	opportunitiesListRouteRefValidator,
	opportunitiesDetailRouteRefValidator,
	sinceLastMeetingRouteRefValidator
);

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

const noNavigationValidator = v.object({
	kind: v.literal('none')
});

export const myDealsDetailInternalLinkValidator = v.object({
	kind: v.literal('internal'),
	route: myDealsDetailRouteRefValidator
});

export const allActivityDetailInternalLinkValidator = v.object({
	kind: v.literal('internal'),
	route: allActivityDetailRouteRefValidator
});

export const dashboardInternalLinkValidator = v.object({
	kind: v.literal('internal'),
	route: dashboardRouteRefValidator
});

export const dashboardExternalLinkValidator = v.object({
	kind: v.literal('external'),
	href: v.string(),
	target: v.optional(v.string()),
	rel: v.optional(v.string())
});

export const dashboardHeaderTitleMenuOptionValidator = v.object({
	id: v.string(),
	label: v.string(),
	route: v.union(myDealsListRouteRefValidator, allActivityListRouteRefValidator),
	current: v.boolean()
});

export const dashboardHeaderTitleMenuValidator = v.object({
	kind: v.literal('link-menu'),
	menuId: v.string(),
	ariaLabel: v.string(),
	sectionLabel: v.string(),
	activeLabel: v.string(),
	options: v.array(dashboardHeaderTitleMenuOptionValidator)
});

export const dashboardHeaderActionValidator = v.union(
	v.literal('share'),
	v.literal('broker-switch')
);

export const dashboardHeaderValidator = v.object({
	leading: v.union(
		v.object({
			kind: v.literal('title'),
			title: v.string()
		}),
		v.object({
			kind: v.literal('title-menu'),
			title: v.string(),
			menu: dashboardHeaderTitleMenuValidator
		}),
		v.object({
			kind: v.literal('control-title'),
			title: v.string(),
			control: v.union(
				v.object({
					kind: v.literal('meeting-date')
				}),
				v.object({
					kind: v.literal('back-link'),
					route: v.union(
						myDealsListRouteRefValidator,
						allActivityListRouteRefValidator,
						opportunitiesListRouteRefValidator
					),
					label: v.string()
				})
			)
		})
	),
	actions: v.optional(v.array(dashboardHeaderActionValidator))
});

export type DashboardHeaderData = DashboardHeader;

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

export const myDealsFeedItemValidator = v.union(
	v.object({
		id: v.string(),
		title: v.string(),
		kind: v.literal('news'),
		dateIso: v.string(),
		navigation: noNavigationValidator
	}),
	v.object({
		id: v.string(),
		title: v.string(),
		kind: v.literal('linkedin'),
		dateIso: v.string(),
		navigation: noNavigationValidator
	}),
	v.object({
		id: v.string(),
		title: v.string(),
		kind: v.literal('activity'),
		dateIso: v.string(),
		navigation: myDealsDetailInternalLinkValidator
	})
);

export const myDealsRowNavigationValidator = v.union(
	myDealsDetailInternalLinkValidator,
	noNavigationValidator
);

export const myDealsTableRowValidator = v.object({
	id: v.id('deals'),
	navigation: myDealsRowNavigationValidator,
	deal: v.string(),
	latestNewsSource: v.union(dealNewsSourceValidator, v.null()),
	latestNews: v.string(),
	lastActivityDescription: v.string(),
	owner: v.union(dashboardPersonValidator, v.null()),
	isReservedInEpic: v.boolean()
});

export const allActivityRowNavigationValidator = v.union(
	allActivityDetailInternalLinkValidator,
	noNavigationValidator
);

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

export const allActivityTableRowValidator = v.object({
	id: v.id('deals'),
	navigation: allActivityRowNavigationValidator,
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

export const opportunityTileValidator = v.object({
	id: v.id('insights'),
	route: opportunitiesDetailRouteRefValidator,
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

export const myDealsListResultValidator = v.object({
	header: dashboardHeaderValidator,
	hero: v.optional(canvasHeroValidator),
	rows: v.array(myDealsTableRowValidator),
	newsItems: v.array(myDealsFeedItemValidator),
	watchlistItems: v.array(myDealsFeedItemValidator)
});

export const myDealsDetailResultValidator = v.object({
	header: dashboardHeaderValidator,
	hero: canvasHeroValidator,
	newsItems: v.array(myDealsFeedItemValidator),
	activityItems: v.array(timelineItemValidator),
	update: fileUploadFieldValidator,
	rightRail: detailRightRailDataValidator
});

export const allActivityListResultValidator = v.object({
	header: dashboardHeaderValidator,
	rows: v.array(allActivityTableRowValidator),
	filterDrawerData: allActivityFilterDrawerDataValidator
});

export const allActivityDetailResultValidator = v.object({
	header: dashboardHeaderValidator,
	hero: canvasHeroValidator,
	activityItems: v.array(timelineItemValidator),
	orgChartNodes: v.array(orgChartNodeRecordValidator),
	update: fileUploadFieldValidator,
	rightRail: detailRightRailDataValidator
});

export const opportunitiesListResultValidator = v.object({
	header: dashboardHeaderValidator,
	hero: canvasHeroValidator,
	opportunityTiles: v.array(opportunityTileValidator),
	riskTiles: v.array(opportunityTileValidator)
});

export const opportunityDetailResultValidator = v.object({
	header: dashboardHeaderValidator,
	hero: canvasHeroValidator,
	kind: dealInsightKindValidator,
	activityItems: v.array(timelineItemValidator),
	orgChartNodes: v.array(orgChartNodeRecordValidator),
	update: fileUploadFieldValidator,
	rightRail: detailRightRailDataValidator
});

export const sinceLastMeetingResultValidator = v.object({
	header: dashboardHeaderValidator,
	hero: canvasHeroValidator,
	referenceMeetingDateIso: v.string(),
	timelineItems: v.array(timelineItemValidator),
	deals: v.array(dealSummaryRowValidator),
	update: fileUploadFieldValidator
});

export type MyDealsFeedItemData =
	| {
			id: string;
			title: string;
			kind: 'news';
			dateIso: IsoDate;
			navigation: {
				kind: 'none';
			};
	  }
	| {
			id: string;
			title: string;
			kind: 'linkedin';
			dateIso: IsoDate;
			navigation: {
				kind: 'none';
			};
	  }
	| {
			id: string;
			title: string;
			kind: 'activity';
			dateIso: IsoDate;
			navigation: InternalLink<MyDealsDetailRouteRef>;
	  };

export type MyDealsTableRowData = {
	id: DealId;
	navigation: Navigation<MyDealsDetailRouteRef>;
	deal: string;
	latestNewsSource: DealNewsSource | null;
	latestNews: string;
	lastActivityDescription: string;
	owner: DashboardPerson | null;
	isReservedInEpic: boolean;
};

export type AllActivityTableRowData = {
	id: DealId;
	navigation: Navigation<AllActivityDetailRouteRef>;
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

export type OpportunityTileData = {
	id: InsightId;
	route: OpportunitiesDetailRouteRef;
	title: string;
	dealNumber: number;
	dealLabel?: string;
	avatars?: string[];
	activityLevel: ActivityLevel;
};

export type DashboardShellQueryResult = {
	people: DashboardPerson[];
	meetingDateIsos: IsoDate[];
	activeMeetingDateIso: IsoDate;
};

export type MyDealsListQueryResult = {
	header: DashboardHeader;
	hero?: CanvasHeroData;
	rows: MyDealsTableRowData[];
	newsItems: MyDealsFeedItemData[];
	watchlistItems: MyDealsFeedItemData[];
};

export type MyDealsDetailQueryResult = {
	header: DashboardHeader;
	hero: CanvasHeroData;
	newsItems: MyDealsFeedItemData[];
	activityItems: TimelineItem[];
	update: FileUploadFieldData;
	rightRail: DetailRightRailData;
};

export type AllActivityListQueryResult = {
	header: DashboardHeader;
	rows: AllActivityTableRowData[];
	filterDrawerData: AllActivityFilterDrawerData;
};

export type AllActivityDetailQueryResult = {
	header: DashboardHeader;
	hero: CanvasHeroData;
	activityItems: TimelineItem[];
	orgChartNodes: OrgChartNodeRecord[];
	update: FileUploadFieldData;
	rightRail: DetailRightRailData;
};

export type OpportunitiesListQueryResult = {
	header: DashboardHeader;
	hero: CanvasHeroData;
	opportunityTiles: OpportunityTileData[];
	riskTiles: OpportunityTileData[];
};

export type OpportunityDetailQueryResult = {
	header: DashboardHeader;
	hero: CanvasHeroData;
	kind: DealInsightKind;
	activityItems: TimelineItem[];
	orgChartNodes: OrgChartNodeRecord[];
	update: FileUploadFieldData;
	rightRail: DetailRightRailData;
};

export type SinceLastMeetingQueryResult = {
	header: DashboardHeader;
	hero: CanvasHeroData;
	referenceMeetingDateIso: IsoDate;
	timelineItems: TimelineItem[];
	deals: DealSummaryRow[];
	update: FileUploadFieldData;
};
