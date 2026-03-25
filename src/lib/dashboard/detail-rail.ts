import { getDealActivityLevel } from '$lib/dashboard/deal-derivations';
import type { ActivityLevel } from '$lib/domain/activity-level';
import { mockDb } from '$lib/mock-db';
import type {
	DealDetailRightRailData,
	DetailRightRailLimitation,
	DetailRightRailMetadata,
	MetadataDetailRightRailData
} from './detail-rail-model';
import { resolveOptionalBrokerPerson } from './deal-view';

type MetadataDetailRightRailOptions = {
	activityLevel?: ActivityLevel;
	limitation?: DetailRightRailLimitation;
};

export function toDetailRightRailMetadata(
	dealId: string,
	activityLevelOverride?: ActivityLevel
): DetailRightRailMetadata | null {
	const deal = mockDb.deals.getById(dealId);

	if (!deal) {
		return null;
	}

	const activityLevel = activityLevelOverride ?? getDealActivityLevel(deal);

	if (!activityLevel) {
		return null;
	}

	return {
		deal: deal.dealName,
		dealNumber: deal.dealNumber,
		activityLevel,
		owner: resolveOptionalBrokerPerson(mockDb.deals.getCurrentOwnerBrokerId(dealId)),
		stage: deal.stage
	};
}

export function toDealDetailRightRailData(dealId: string): DealDetailRightRailData | null {
	const deal = mockDb.deals.getById(dealId);
	const detailContext = mockDb.contexts.getByDealId(dealId);
	const metadata = toDetailRightRailMetadata(dealId);

	if (!deal || !detailContext || !deal.activityTrend || !metadata) {
		return null;
	}

	return {
		kind: 'deal',
		metadata,
		timing: {
			claimedAtIso: detailContext.claimedAtIso,
			lastActivityAtIso: deal.lastActivityAtIso ?? null
		},
		activityTrend: deal.activityTrend
	};
}

export function toMetadataDetailRightRailData(
	dealId: string,
	options: MetadataDetailRightRailOptions = {}
): MetadataDetailRightRailData | null {
	const metadata = toDetailRightRailMetadata(dealId, options.activityLevel);

	if (!metadata) {
		return null;
	}

	return {
		kind: 'metadata',
		metadata,
		...(options.limitation ? { limitation: options.limitation } : {})
	};
}
