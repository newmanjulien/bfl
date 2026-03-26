import type {
	DealActivityStream,
	DealContextRecord,
	DealInsightKind,
	DealSnapshotRecord,
	DealRecord,
	DealInsightRecord,
	DealStateRecord
} from '$lib/domain/deals';
import type { BrokerId } from '../reference/records';
import { createSnapshot } from '../snapshot';
import {
	dealActivities,
	dealBrokerLinks,
	dealContexts,
	dealInsights,
	dealNews,
	dealStates,
	deals
} from './records';

const dealsById = new Map<string, DealRecord>(deals.map((record) => [record.dealId, record]));
const dealStatesByDealId = new Map<string, DealStateRecord>(
	dealStates.map((record) => [record.dealId, record])
);
const contextsByDealId = new Map<string, DealContextRecord<BrokerId>>(
	dealContexts.map((record) => [record.dealId, record])
);
const insightsById = new Map<string, DealInsightRecord<BrokerId>>(
	dealInsights.map((record) => [record.id, record])
);

function toDealSnapshotRecord(deal: DealRecord): DealSnapshotRecord {
	const dealState = dealStatesByDealId.get(deal.dealId);

	if (!dealState) {
		throw new Error(`Unknown deal state for deal "${deal.dealId}".`);
	}

	return {
		...deal,
		...dealState
	};
}

function listDeals() {
	return createSnapshot(deals.map((record) => toDealSnapshotRecord(record)));
}

function listDealIds() {
	return createSnapshot(deals.map((deal) => deal.dealId));
}

function getDealById(dealId: string) {
	const deal = dealsById.get(dealId);

	return deal ? createSnapshot(toDealSnapshotRecord(deal)) : null;
}

function requireDealById(dealId: string) {
	const deal = getDealById(dealId);

	if (!deal) {
		throw new Error(`Unknown deal id "${dealId}".`);
	}

	return deal;
}

function getDealCurrentOwnerBrokerId(dealId: string) {
	return (
		dealBrokerLinks.find((link) => link.dealId === dealId && link.relationship === 'owner')
			?.brokerId ?? null
	);
}

function getDealMemberBrokerIds(dealId: string) {
	return createSnapshot(
		dealBrokerLinks
			.filter((link) => link.dealId === dealId && link.relationship === 'member')
			.map((link) => link.brokerId)
	);
}

function listActivities(options?: {
	stream?: DealActivityStream;
}) {
	return createSnapshot(
		dealActivities.filter((record) => !options?.stream || record.stream === options.stream)
	);
}

function listActivitiesByDealId(
	dealId: string,
	options?: {
		stream?: DealActivityStream;
	}
) {
	return createSnapshot(
		dealActivities.filter(
			(record) => record.dealId === dealId && (!options?.stream || record.stream === options.stream)
		)
	);
}

function listNews() {
	return createSnapshot(dealNews);
}

function listNewsByDealId(dealId: string) {
	return createSnapshot(dealNews.filter((record) => record.dealId === dealId));
}

function listContexts() {
	return createSnapshot(dealContexts);
}

function getContextByDealId(dealId: string) {
	const context = contextsByDealId.get(dealId);

	return context ? createSnapshot(context) : null;
}

function listInsights(options?: {
	kind?: DealInsightKind;
}) {
	return createSnapshot(
		dealInsights.filter((record) => !options?.kind || record.kind === options.kind)
	);
}

function listInsightsByDealId(
	dealId: string,
	options?: {
		kind?: DealInsightKind;
	}
) {
	return createSnapshot(
		dealInsights.filter(
			(record) =>
				record.dealId === dealId && (!options?.kind || record.kind === options.kind)
		)
	);
}

function getInsightById(insightId: string) {
	const insight = insightsById.get(insightId);

	return insight ? createSnapshot(insight) : null;
}

function requireInsightById(insightId: string) {
	const insight = getInsightById(insightId);

	if (!insight) {
		throw new Error(`Unknown insight id "${insightId}".`);
	}

	return insight;
}

export const dealReaders = Object.freeze({
	deals: Object.freeze({
		list: listDeals,
		listIds: listDealIds,
		getById: getDealById,
		requireById: requireDealById,
		getCurrentOwnerBrokerId: getDealCurrentOwnerBrokerId,
		getMemberBrokerIds: getDealMemberBrokerIds
	}),
	activities: Object.freeze({
		list: listActivities,
		listByDealId: listActivitiesByDealId
	}),
	news: Object.freeze({
		list: listNews,
		listByDealId: listNewsByDealId
	}),
	contexts: Object.freeze({
		list: listContexts,
		getByDealId: getContextByDealId
	}),
	insights: Object.freeze({
		list: listInsights,
		listByDealId: listInsightsByDealId,
		getById: getInsightById,
		requireById: requireInsightById
	})
});
