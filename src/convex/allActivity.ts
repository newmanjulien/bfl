import { v } from 'convex/values';
import { query } from './_generated/server';
import { type AllActivityView } from '../lib/dashboard/routing/all-activity';
import { getActivityLevelLabel, sortDealActivitiesAscending } from '../lib/dashboard/view-models/deal';
import {
	createPersonSummaryMap,
	type PersonSummaryMap,
	resolveOptionalBrokerPerson,
	toTimelineItem
} from '../lib/dashboard/view-models/deal-content';
import {
	buildDealHero,
	buildDealUploadFieldData
} from '../lib/dashboard/view-models/detail-builders';
import {
	toDetailRightRailData,
	toDetailRightRailHelpfulContactsSection,
	toDetailRightRailOverviewSection,
	toDetailRightRailTimingSection
} from '../lib/dashboard/detail/right-rail';
import { DEAL_INDUSTRIES, type ActivityLevel, type DealIndustry } from '../lib/types/vocab';
import {
	type DealRecordData,
	toActivityRecord,
	toDashboardPerson,
	toDealRecord
} from './readModels';
import {
	type AllActivityDetailReadModel,
	type AllActivityListReadModel,
	type DashboardPerson,
	allActivityDetailReadModelValidator,
	allActivityListReadModelValidator,
	allActivityViewValidator
} from './validators';

export type {
	AllActivityDetailReadModel,
	AllActivityDetailRef,
	AllActivityListReadModel,
	DashboardShellReadModel
} from './validators';

const NO_ACTIVITY_LABEL = 'No recorded activity';

type RowCollections = {
	allActivityTableRows: ReturnType<typeof toAllActivityTableRow>[];
	needSupportRows: ReturnType<typeof toAllActivityTableRow>[];
	duplicatedWorkRows: ReturnType<typeof toAllActivityTableRow>[];
	noActivityTableRows: ReturnType<typeof toAllActivityTableRow>[];
	likelyOutOfDateViewRows: ReturnType<typeof toAllActivityTableRow>[];
};

function hasListActivityData(
	deal: DealRecordData
): deal is DealRecordData & {
	lastActivityAtIso: NonNullable<DealRecordData['lastActivityAtIso']>;
} {
	return Boolean(deal.lastActivityAtIso);
}

function toAllActivityRowNavigation(
	deal: DealRecordData
) {
	return deal.context
		? {
				dealId: deal.id
			}
		: null;
}

function toAllActivityTableRow(
	deal: DealRecordData,
	view: AllActivityView,
	lastActivity:
		| {
				kind: 'relative';
				atIso: NonNullable<DealRecordData['lastActivityAtIso']>;
		  }
		| {
				kind: 'text';
				label: string;
		  },
	peopleById: PersonSummaryMap<DashboardPerson>
) {
	return {
		id: deal.id,
		detail: toAllActivityRowNavigation(deal),
		probability: deal.probability,
		activityLevel: deal.activityLevel,
		deal: deal.dealName,
		stage: deal.stage,
		lastActivity,
		owner: resolveOptionalBrokerPerson(peopleById, deal.ownerBrokerId)
	};
}

function toRelativeLastActivityRow(
	deal: DealRecordData & {
		lastActivityAtIso: NonNullable<DealRecordData['lastActivityAtIso']>;
	},
	view: AllActivityView,
	peopleById: PersonSummaryMap<DashboardPerson>
) {
	return toAllActivityTableRow(
		deal,
		view,
		{
			kind: 'relative',
			atIso: deal.lastActivityAtIso
		},
		peopleById
	);
}

function toNoActivityRow(
	deal: DealRecordData,
	view: AllActivityView,
	peopleById: PersonSummaryMap<DashboardPerson>
) {
	return toAllActivityTableRow(
		deal,
		view,
		{
			kind: 'text',
			label: NO_ACTIVITY_LABEL
		},
		peopleById
	);
}

function toNonNavigableRow(row: ReturnType<typeof toAllActivityTableRow>) {
	if (!row.detail) {
		return row;
	}

	return {
		...row,
		detail: null
	};
}

function filterFlaggedRows(
	deals: readonly DealRecordData[],
	view: AllActivityView,
	peopleById: PersonSummaryMap<DashboardPerson>,
	flag: keyof DealRecordData['dashboardFlags']
) {
	return deals
		.filter((deal) => deal.dashboardFlags[flag])
		.map((deal) =>
			hasListActivityData(deal)
				? toRelativeLastActivityRow(deal, view, peopleById)
				: toNoActivityRow(deal, view, peopleById)
		);
}

function buildRowCollections(
	deals: readonly DealRecordData[],
	view: AllActivityView,
	peopleById: PersonSummaryMap<DashboardPerson>
): RowCollections {
	const allActivityRows = deals.filter(hasListActivityData);
	const noActivityRows = deals.filter((deal) => !hasListActivityData(deal));
	const likelyOutOfDateRows = deals.filter((deal) => deal.isLikelyOutOfDate);

	return {
		allActivityTableRows: allActivityRows.map((deal) =>
			toRelativeLastActivityRow(deal, view, peopleById)
		),
		needSupportRows: filterFlaggedRows(deals, view, peopleById, 'needsSupport'),
		duplicatedWorkRows: filterFlaggedRows(deals, view, peopleById, 'duplicatedWork'),
		noActivityTableRows: noActivityRows.map((deal) => toNoActivityRow(deal, view, peopleById)),
		likelyOutOfDateViewRows: likelyOutOfDateRows.map((deal) =>
			toNonNavigableRow(
				hasListActivityData(deal)
					? toRelativeLastActivityRow(deal, view, peopleById)
					: toNoActivityRow(deal, view, peopleById)
			)
		)
	};
}

function resolveRowsForView(view: AllActivityView, collections: RowCollections) {
	return view === 'need-support'
		? collections.needSupportRows
		: view === 'duplicated-work'
			? collections.duplicatedWorkRows
			: view === 'unassigned'
				? collections.noActivityTableRows
				: view === 'likely-out-of-date'
					? collections.likelyOutOfDateViewRows
					: collections.allActivityTableRows;
}

function createFilterDrawerData(people: ReturnType<typeof toDashboardPerson>[], deals: readonly DealRecordData[]) {
	const industries = new Set(deals.map((deal) => deal.industry));

	return {
		brokers: people,
		activityLevels: [
			{ id: 'high' as ActivityLevel, label: getActivityLevelLabel('high') },
			{ id: 'medium' as ActivityLevel, label: getActivityLevelLabel('medium') },
			{ id: 'low' as ActivityLevel, label: getActivityLevelLabel('low') }
		],
		industries: DEAL_INDUSTRIES.filter((industry) => industries.has(industry)).map((industry) => ({
			id: industry as DealIndustry,
			label: industry
		}))
	};
}

export const getAllActivityList = query({
	args: {
		view: allActivityViewValidator
	},
	returns: allActivityListReadModelValidator,
	handler: async (ctx, args): Promise<AllActivityListReadModel> => {
		const selectedView = args.view as AllActivityView;
		const [brokers, deals] = await Promise.all([
			ctx.db.query('brokers').collect(),
			ctx.db.query('deals').collect()
		]);
		const people = brokers.map((broker) => toDashboardPerson(broker));
		const peopleById = createPersonSummaryMap(people);
		const dealRecords = deals.map((deal) => toDealRecord(deal));
		const collections = buildRowCollections(dealRecords, selectedView, peopleById);

		return {
			rows: resolveRowsForView(selectedView, collections),
			filterDrawerData: createFilterDrawerData(people, dealRecords)
		};
	}
});

export const getAllActivityDetail = query({
	args: {
		detailId: v.string(),
		view: allActivityViewValidator
	},
	returns: v.union(allActivityDetailReadModelValidator, v.null()),
	handler: async (ctx, args): Promise<AllActivityDetailReadModel | null> => {
		const normalizedDealId = await ctx.db.normalizeId('deals', args.detailId);

		if (!normalizedDealId) {
			return null;
		}

		const [deal, activities, brokers] = await Promise.all([
			ctx.db.get(normalizedDealId),
			ctx.db
				.query('activities')
				.withIndex('by_deal_id_stream_occurred_on_iso', (query) =>
					query.eq('dealId', normalizedDealId).eq('stream', 'deal-detail')
				)
				.collect(),
			ctx.db.query('brokers').collect()
		]);

		if (!deal) {
			return null;
		}

		const dealRecord = toDealRecord(deal);
		const context = dealRecord.context;

		if (!context) {
			return null;
		}

		const people = brokers.map((broker) => toDashboardPerson(broker));
		const peopleById = createPersonSummaryMap(people);

		return {
			title: dealRecord.dealName,
			hero: buildDealHero({
				dealNumber: dealRecord.dealNumber,
				dealName: dealRecord.dealName,
				stage: dealRecord.stage,
				probability: dealRecord.probability,
				activityLevel: dealRecord.activityLevel,
				context
			}),
			activityItems: sortDealActivitiesAscending(
				activities.map((activity) => toActivityRecord(activity))
			).map((activity) => toTimelineItem(activity, peopleById)),
			orgChartNodes: context.orgChartNodes,
			update: buildDealUploadFieldData(dealRecord.dealName),
			rightRail: toDetailRightRailData([
				toDetailRightRailOverviewSection(
					dealRecord,
					resolveOptionalBrokerPerson(peopleById, dealRecord.ownerBrokerId)
				),
				toDetailRightRailTimingSection(dealRecord, context),
				toDetailRightRailHelpfulContactsSection(context)
			])
		};
	}
});
