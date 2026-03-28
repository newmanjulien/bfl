import { v } from 'convex/values';
import { query } from './_generated/server';
import {
	createPersonSummaryMap,
	type PersonSummaryMap,
	resolveOptionalBrokerPerson,
	toTimelineItem
} from '../lib/dashboard/view-models/deal-content';
import {
	buildDealUploadFieldData
} from '../lib/dashboard/view-models/detail-builders';
import {
	toDetailRightRailData,
	toDetailRightRailOverviewSection
} from '../lib/dashboard/detail/right-rail';
import {
	type DealRecordData,
	type InsightRecordData,
	toDashboardPeople,
	toDealRecord,
	toInsightRecord
} from './readModels';
import {
	type DashboardPerson,
	type OpportunityDetailReadModel,
	type OpportunitiesListReadModel,
	opportunityDetailReadModelValidator,
	opportunitiesListReadModelValidator
} from './validators';

export type {
	DashboardShellReadModel,
	OpportunityDetailReadModel,
	OpportunityDetailRef,
	OpportunitiesListReadModel
} from './validators';

type OpportunityTileAvatars = string[];

function getOwnerAvatars(
	insight: Pick<InsightRecordData, 'ownerBrokerId' | 'collaboratorBrokerIds'>,
	peopleById: PersonSummaryMap<DashboardPerson>
): OpportunityTileAvatars {
	const ownerAvatar = peopleById.get(insight.ownerBrokerId)?.avatar;

	if (!ownerAvatar) {
		throw new Error(`Unknown owner broker "${insight.ownerBrokerId}".`);
	}

	return [
		ownerAvatar,
		...insight.collaboratorBrokerIds.flatMap((brokerId) => {
			const avatar = peopleById.get(brokerId)?.avatar;
			return avatar ? [avatar] : [];
		})
	];
}

function toTile(
	insight: InsightRecordData,
	deal: DealRecordData,
	peopleById: PersonSummaryMap<DashboardPerson>
) {
	return {
		id: insight.id,
		detail: {
			insightId: insight.id
		},
		title: insight.title,
		dealNumber: deal.dealNumber,
		dealLabel: deal.dealName,
		avatars: getOwnerAvatars(insight, peopleById),
		activityLevel: deal.activityLevel
	};
}

function toRightRailData(
	deal: DealRecordData,
	peopleById: PersonSummaryMap<DashboardPerson>
) {
	return toDetailRightRailData([
		toDetailRightRailOverviewSection(
			deal,
			resolveOptionalBrokerPerson(peopleById, deal.ownerBrokerId)
		)
	]);
}

export const getOpportunitiesList = query({
	args: {},
	returns: opportunitiesListReadModelValidator,
	handler: async (ctx): Promise<OpportunitiesListReadModel> => {
		const [brokers, insights, deals] = await Promise.all([
			ctx.db.query('brokers').collect(),
			ctx.db.query('insights').collect(),
			ctx.db.query('deals').collect()
		]);
		const peopleById = createPersonSummaryMap(await toDashboardPeople(ctx, brokers));
		const dealsById = new Map(deals.map((deal) => [deal._id, toDealRecord(deal)] as const));
		const insightRecords = insights.map((insight) => toInsightRecord(insight));

		const opportunityTiles = insightRecords
			.filter((insight) => insight.kind === 'opportunity')
			.map((insight) => {
				const deal = dealsById.get(insight.dealId);

				if (!deal) {
					throw new Error(`Unknown deal "${insight.dealId}" for insight "${insight.id}".`);
				}

				return toTile(insight, deal, peopleById);
			});
		const riskTiles = insightRecords
			.filter((insight) => insight.kind === 'risk')
			.map((insight) => {
				const deal = dealsById.get(insight.dealId);

				if (!deal) {
					throw new Error(`Unknown deal "${insight.dealId}" for insight "${insight.id}".`);
				}

				return toTile(insight, deal, peopleById);
			});

		return {
			opportunityTiles,
			riskTiles,
			update: buildDealUploadFieldData(
				'your opportunities and risks',
				'Upload call notes, screenshots, or procurement docs that add context to'
			)
		};
	}
});

export const getOpportunityDetail = query({
	args: {
		detailId: v.string()
	},
	returns: v.union(opportunityDetailReadModelValidator, v.null()),
	handler: async (ctx, args): Promise<OpportunityDetailReadModel | null> => {
		const normalizedInsightId = await ctx.db.normalizeId('insights', args.detailId);

		if (!normalizedInsightId) {
			return null;
		}

		const [insight, brokers] = await Promise.all([
			ctx.db.get(normalizedInsightId),
			ctx.db.query('brokers').collect()
		]);

		if (!insight) {
			return null;
		}

		const deal = await ctx.db.get(insight.dealId);

		if (!deal) {
			throw new Error(`Unknown deal "${insight.dealId}" for insight "${insight._id}".`);
		}

		const people = await toDashboardPeople(ctx, brokers);
		const peopleById = createPersonSummaryMap(people);
		const dealRecord = toDealRecord(deal);
		const insightRecord = toInsightRecord(insight);

		return {
			title: insightRecord.title,
			hero: {
				dealNumber: dealRecord.dealNumber,
				title: insightRecord.title
			},
			kind: insightRecord.kind,
			activityItems: insightRecord.timeline.map((activity) => toTimelineItem(activity, peopleById)),
			orgChartNodes: insightRecord.orgChartNodes,
			update: buildDealUploadFieldData(
				'this opportunity or risk',
				'Upload call notes, screenshots, or procurement docs that add context to'
			),
			rightRail: toRightRailData(dealRecord, peopleById)
		};
	}
});
