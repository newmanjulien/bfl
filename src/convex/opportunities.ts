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
import { createOpportunitiesDetailHeader, createOpportunitiesListHeader } from './headers';
import {
	type DealRecordData,
	type InsightRecordData,
	toDashboardPerson,
	toDealRecord,
	toInsightRecord
} from './readModels';
import {
	type DashboardPerson,
	type OpportunityDetailQueryResult,
	type OpportunitiesListQueryResult,
	opportunityDetailResultValidator,
	opportunitiesListResultValidator
} from './validators';

export type { OpportunityDetailQueryResult, OpportunitiesListQueryResult } from './validators';

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
		route: {
			kind: 'opportunities-detail' as const,
			insightId: insight.id
		},
		title: insight.title,
		dealNumber: deal.dealNumber,
		dealLabel: deal.accountName,
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
	returns: opportunitiesListResultValidator,
	handler: async (ctx): Promise<OpportunitiesListQueryResult> => {
		const [brokers, insights, deals] = await Promise.all([
			ctx.db.query('brokers').collect(),
			ctx.db.query('insights').collect(),
			ctx.db.query('deals').collect()
		]);
		const peopleById = createPersonSummaryMap(brokers.map((broker) => toDashboardPerson(broker)));
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
			header: createOpportunitiesListHeader(),
			hero: {
				title: 'Opportunities & risks you might help with',
				description: 'Help Julien take advantage of key opportunities and risks'
			},
			opportunityTiles,
			riskTiles
		};
	}
});

export const getOpportunityDetail = query({
	args: {
		detailId: v.string()
	},
	returns: v.union(opportunityDetailResultValidator, v.null()),
	handler: async (ctx, args): Promise<OpportunityDetailQueryResult | null> => {
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

		const people = brokers.map((broker) => toDashboardPerson(broker));
		const peopleById = createPersonSummaryMap(people);
		const dealRecord = toDealRecord(deal);
		const insightRecord = toInsightRecord(insight);

		return {
			header: createOpportunitiesDetailHeader(insightRecord.title),
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
