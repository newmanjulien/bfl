import { v } from 'convex/values';
import { query } from './_generated/server';
import type { BrokerId } from '../lib/types/ids';
import type { DealKey } from '../lib/types/keys';
import { type NewBusinessView } from '../lib/dashboard/routing/new-business';
import { getActivityLevelLabel, sortDealActivitiesAscending } from '../lib/dashboard/view-models/deal';
import {
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
	createBrokerKeyByIdMap,
	createDashboardPersonByBrokerIdMap,
	findDealDocumentByKey,
	toActivityRecord,
	toBrokerRecord,
	toDashboardOrgChartNodes,
	toDashboardPeople,
	toDealRecord
} from './readModels';
import {
	type DashboardPerson,
	type NewBusinessDetailReadModel,
	type NewBusinessListReadModel,
	newBusinessDetailReadModelValidator,
	newBusinessListReadModelValidator,
	newBusinessViewValidator
} from './validators';

export type {
	DashboardShellReadModel,
	NewBusinessDetailReadModel,
	NewBusinessDetailRef,
	NewBusinessListReadModel
} from './validators';

const NO_ACTIVITY_LABEL = 'No recorded activity';

type RowCollections = {
	newBusinessTableRows: ReturnType<typeof toNewBusinessTableRow>[];
	needSupportRows: ReturnType<typeof toNewBusinessTableRow>[];
	duplicatedWorkRows: ReturnType<typeof toNewBusinessTableRow>[];
	noActivityTableRows: ReturnType<typeof toNewBusinessTableRow>[];
	likelyOutOfDateViewRows: ReturnType<typeof toNewBusinessTableRow>[];
};

function hasListActivityData(
	deal: DealRecordData
): deal is DealRecordData & {
	lastActivityAtIso: NonNullable<DealRecordData['lastActivityAtIso']>;
} {
	return Boolean(deal.lastActivityAtIso);
}

function toNewBusinessRowNavigation(deal: DealRecordData) {
	return deal.context
		? {
				dealKey: deal.key
			}
		: null;
}

function toNewBusinessTableRow(
	deal: DealRecordData,
	lastActivity:
		| {
				kind: 'relative';
				atIso: NonNullable<DealRecordData['lastActivityAtIso']>;
		  }
		| {
				kind: 'text';
				label: string;
		  },
	peopleByBrokerId: PersonSummaryMap<DashboardPerson, BrokerId>
) {
	return {
		key: deal.key,
		detail: toNewBusinessRowNavigation(deal),
		probability: deal.probability,
		activityLevel: deal.activityLevel,
		deal: deal.dealName,
		stage: deal.stage,
		lastActivity,
		owner: resolveOptionalBrokerPerson(peopleByBrokerId, deal.ownerBrokerId)
	};
}

function toRelativeLastActivityRow(
	deal: DealRecordData & {
		lastActivityAtIso: NonNullable<DealRecordData['lastActivityAtIso']>;
	},
	peopleByBrokerId: PersonSummaryMap<DashboardPerson, BrokerId>
) {
	return toNewBusinessTableRow(
		deal,
		{
			kind: 'relative',
			atIso: deal.lastActivityAtIso
		},
		peopleByBrokerId
	);
}

function toNoActivityRow(
	deal: DealRecordData,
	peopleByBrokerId: PersonSummaryMap<DashboardPerson, BrokerId>
) {
	return toNewBusinessTableRow(
		deal,
		{
			kind: 'text',
			label: NO_ACTIVITY_LABEL
		},
		peopleByBrokerId
	);
}

function toNonNavigableRow(row: ReturnType<typeof toNewBusinessTableRow>) {
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
	peopleByBrokerId: PersonSummaryMap<DashboardPerson, BrokerId>,
	flag: keyof DealRecordData['dashboardFlags']
) {
	return deals
		.filter((deal) => deal.dashboardFlags[flag])
		.map((deal) =>
			hasListActivityData(deal)
				? toRelativeLastActivityRow(deal, peopleByBrokerId)
				: toNoActivityRow(deal, peopleByBrokerId)
		);
}

function buildRowCollections(
	deals: readonly DealRecordData[],
	peopleByBrokerId: PersonSummaryMap<DashboardPerson, BrokerId>
): RowCollections {
	const newBusinessRows = deals.filter(hasListActivityData);
	const noActivityRows = deals.filter((deal) => !hasListActivityData(deal));
	const likelyOutOfDateRows = deals.filter((deal) => deal.isLikelyOutOfDate);

	return {
		newBusinessTableRows: newBusinessRows.map((deal) =>
			toRelativeLastActivityRow(deal, peopleByBrokerId)
		),
		needSupportRows: filterFlaggedRows(deals, peopleByBrokerId, 'needsSupport'),
		duplicatedWorkRows: filterFlaggedRows(deals, peopleByBrokerId, 'duplicatedWork'),
		noActivityTableRows: noActivityRows.map((deal) => toNoActivityRow(deal, peopleByBrokerId)),
		likelyOutOfDateViewRows: likelyOutOfDateRows.map((deal) =>
			toNonNavigableRow(
				hasListActivityData(deal)
					? toRelativeLastActivityRow(deal, peopleByBrokerId)
					: toNoActivityRow(deal, peopleByBrokerId)
			)
		)
	};
}

function resolveRowsForView(view: NewBusinessView, collections: RowCollections) {
	return view === 'need-support'
		? collections.needSupportRows
		: view === 'duplicated-work'
			? collections.duplicatedWorkRows
			: view === 'unassigned'
				? collections.noActivityTableRows
				: view === 'likely-out-of-date'
					? collections.likelyOutOfDateViewRows
					: collections.newBusinessTableRows;
}

function createFilterDrawerData(people: DashboardPerson[], deals: readonly DealRecordData[]) {
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

export const getNewBusinessList = query({
	args: {
		view: newBusinessViewValidator
	},
	returns: newBusinessListReadModelValidator,
	handler: async (ctx, args): Promise<NewBusinessListReadModel> => {
		const selectedView = args.view as NewBusinessView;
		const [brokers, deals] = await Promise.all([
			ctx.db.query('brokers').collect(),
			ctx.db.query('deals').collect()
		]);
		const brokerRecords = await Promise.all(brokers.map((broker) => toBrokerRecord(ctx, broker)));
		const people = toDashboardPeople(brokerRecords);
		const peopleByBrokerId = createDashboardPersonByBrokerIdMap(brokerRecords);
		const dealRecords = deals.map((deal) => toDealRecord(deal));
		const collections = buildRowCollections(dealRecords, peopleByBrokerId);

		return {
			rows: resolveRowsForView(selectedView, collections),
			filterDrawerData: createFilterDrawerData(people, dealRecords)
		};
	}
});

export const getNewBusinessDetail = query({
	args: {
		dealKey: v.string(),
		view: newBusinessViewValidator
	},
	returns: v.union(newBusinessDetailReadModelValidator, v.null()),
	handler: async (ctx, args): Promise<NewBusinessDetailReadModel | null> => {
		const [deal, brokers] = await Promise.all([
			findDealDocumentByKey(ctx, args.dealKey as DealKey),
			ctx.db.query('brokers').collect()
		]);

		if (!deal) {
			return null;
		}

		const activities = await ctx.db
			.query('activities')
			.withIndex('by_deal_id_stream_occurred_on_iso', (query) =>
				query.eq('dealId', deal._id).eq('stream', 'deal-detail')
			)
			.collect();

		const dealRecord = toDealRecord(deal);
		const context = dealRecord.context;

		if (!context) {
			return null;
		}

		const brokerRecords = await Promise.all(brokers.map((broker) => toBrokerRecord(ctx, broker)));
		const peopleByBrokerId = createDashboardPersonByBrokerIdMap(brokerRecords);
		const brokerKeyById = createBrokerKeyByIdMap(brokerRecords);

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
			).map((activity) => toTimelineItem(activity, peopleByBrokerId)),
			orgChartNodes: toDashboardOrgChartNodes(context.orgChartNodes, brokerKeyById),
			update: buildDealUploadFieldData(dealRecord.dealName),
			rightRail: toDetailRightRailData([
				toDetailRightRailOverviewSection(
					dealRecord,
					resolveOptionalBrokerPerson(peopleByBrokerId, dealRecord.ownerBrokerId)
				),
				toDetailRightRailTimingSection(dealRecord, context),
				toDetailRightRailHelpfulContactsSection(context)
			])
		};
	}
});
