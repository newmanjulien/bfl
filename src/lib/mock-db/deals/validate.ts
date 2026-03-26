import type {
	DealActivityRecord,
	DealBrokerLinkRecord,
	DealContextRecord,
	DealHelpfulContactRecord,
	DealInsightRecord,
	DealNewsRecord,
	DealStateRecord
} from '$lib/domain/deals';
import { DEAL_INDUSTRIES } from '$lib/domain/deals';
import type { OrgChartContactNode } from '$lib/domain/org-chart';
import { brokerRecords, type BrokerId } from '../reference/records';
import {
	dealActivities,
	dealBrokerLinks,
	dealContexts,
	dealInsights,
	dealNews,
	dealStates,
	deals
} from './records';

function assertUniqueValue(value: string | number, values: Set<string | number>, context: string) {
	if (values.has(value)) {
		throw new Error(`Duplicate ${context} detected: ${String(value)}.`);
	}

	values.add(value);
}

const brokerIds = new Set<string>(brokerRecords.map((broker) => broker.id));

function hasBrokerId(brokerId: string): brokerId is BrokerId {
	return brokerIds.has(brokerId);
}

function assertBrokerIdExists(brokerId: string, context: string) {
	if (!hasBrokerId(brokerId)) {
		throw new Error(`Unknown broker id "${brokerId}" in ${context}.`);
	}
}

function assertOrgChartBrokerReferences(
	node: OrgChartContactNode<BrokerId>,
	context: string
) {
	assertBrokerIdExists(node.lastContactedById, `${context} org chart node ${node.id}`);

	for (const directReport of node.directReports ?? []) {
		assertOrgChartBrokerReferences(directReport, context);
	}
}

function assertActivityBrokerReferences(
	activity: DealActivityRecord<BrokerId>,
	context: string
) {
	if (activity.marker.kind === 'broker-avatar') {
		assertBrokerIdExists(activity.marker.brokerId, `${context} activity marker ${activity.id}`);
	}

	if (activity.kind === 'actor-action') {
		assertBrokerIdExists(activity.actorBrokerId, `${context} activity actor ${activity.id}`);
	}
}

function assertInsightBrokerReferences(insight: DealInsightRecord<BrokerId>) {
	for (const ownerBrokerId of insight.ownerBrokerIds) {
		assertBrokerIdExists(ownerBrokerId, `deal insight owner ${insight.id}`);
	}

	for (const activity of insight.timeline) {
		assertActivityBrokerReferences(activity, `deal insight ${insight.id}`);
	}

	assertOrgChartBrokerReferences(insight.orgChartRoot, `deal insight ${insight.id}`);
}

function assertContextBrokerReferences(context: DealContextRecord<BrokerId>) {
	assertOrgChartBrokerReferences(context.orgChartRoot, `deal context ${context.dealId}`);
}

function assertHelpfulContactReferences(
	helpfulContact: DealHelpfulContactRecord,
	dealId: string
) {
	if (helpfulContact.linkedInUrl.trim().length === 0) {
		throw new Error(
			`Deal context ${dealId} helpful contact ${helpfulContact.id} is missing linkedInUrl.`
		);
	}
}

function assertContextHelpfulContacts(context: DealContextRecord<BrokerId>) {
	const helpfulContactIds = new Set<string | number>();

	for (const helpfulContact of context.helpfulContacts ?? []) {
		assertUniqueValue(
			helpfulContact.id,
			helpfulContactIds,
			`deal context helpful contact id for ${context.dealId}`
		);
		assertHelpfulContactReferences(helpfulContact, context.dealId);
	}
}

function assertDealStateReferences(
	dealState: DealStateRecord,
	dealIds: ReadonlySet<string>
) {
	if (!dealIds.has(dealState.dealId)) {
		throw new Error(`Deal state references an unknown deal: ${dealState.dealId}.`);
	}
}

function assertDealReferencesExist() {
	const dealIds = new Set(deals.map((deal) => deal.dealId));
	const dealNumberValues = new Set<string | number>();
	const dealIdValues = new Set<string | number>();
	const dealStateDealIdValues = new Set<string | number>();
	const dealBrokerLinkIdValues = new Set<string | number>();
	const dealActivityIdValues = new Set<string | number>();
	const dealNewsIdValues = new Set<string | number>();
	const dealInsightIdValues = new Set<string | number>();
	const dealContextDealIdValues = new Set<string | number>();

	for (const deal of deals) {
		assertUniqueValue(deal.dealId, dealIdValues, 'dealId');
		assertUniqueValue(deal.dealNumber, dealNumberValues, 'dealNumber');

		if (!DEAL_INDUSTRIES.includes(deal.industry)) {
			throw new Error(`Deal ${deal.dealId} has unknown industry "${deal.industry}".`);
		}
	}

	for (const dealState of dealStates) {
		assertUniqueValue(dealState.dealId, dealStateDealIdValues, 'deal state dealId');
		assertDealStateReferences(dealState, dealIds);
	}

	for (const link of dealBrokerLinks) {
		assertUniqueValue(link.id, dealBrokerLinkIdValues, 'deal broker link id');
		assertLinkReferences(link, dealIds);
	}

	for (const activity of dealActivities) {
		assertUniqueValue(activity.id, dealActivityIdValues, 'deal activity id');
		assertActivityReferences(activity, dealIds);
	}

	for (const newsItem of dealNews) {
		assertUniqueValue(newsItem.id, dealNewsIdValues, 'deal news id');
		assertNewsReferences(newsItem, dealIds);
	}

	for (const insight of dealInsights) {
		assertUniqueValue(insight.id, dealInsightIdValues, 'deal insight id');
		assertInsightReferences(insight, dealIds);
	}

	for (const context of dealContexts) {
		assertUniqueValue(context.dealId, dealContextDealIdValues, 'deal context dealId');
		assertContextReferences(context, dealIds);
	}

	for (const dealId of dealIds) {
		if (!dealStateDealIdValues.has(dealId)) {
			throw new Error(`Deal ${dealId} is missing a deal state record.`);
		}

		const ownerLinks = dealBrokerLinks.filter(
			(link) => link.dealId === dealId && link.relationship === 'owner'
		);

		if (ownerLinks.length > 1) {
			throw new Error(`Deal ${dealId} has more than one owner link.`);
		}
	}
}

function assertLinkReferences(
	link: DealBrokerLinkRecord<BrokerId>,
	dealIds: ReadonlySet<string>
) {
	if (!dealIds.has(link.dealId)) {
		throw new Error(`Deal broker link ${link.id} references an unknown deal: ${link.dealId}.`);
	}

	assertBrokerIdExists(link.brokerId, `deal broker link ${link.id}`);
}

function assertActivityReferences(
	activity: DealActivityRecord<BrokerId>,
	dealIds: ReadonlySet<string>
) {
	if (!dealIds.has(activity.dealId)) {
		throw new Error(`Deal activity ${activity.id} references an unknown deal: ${activity.dealId}.`);
	}

	assertActivityBrokerReferences(activity, 'deal activity');
}

function assertNewsReferences(newsItem: DealNewsRecord, dealIds: ReadonlySet<string>) {
	if (!dealIds.has(newsItem.dealId)) {
		throw new Error(`Deal news ${newsItem.id} references an unknown deal: ${newsItem.dealId}.`);
	}
}

function assertInsightReferences(
	insight: DealInsightRecord<BrokerId>,
	dealIds: ReadonlySet<string>
) {
	if (!dealIds.has(insight.dealId)) {
		throw new Error(`Deal insight ${insight.id} references an unknown deal: ${insight.dealId}.`);
	}

	assertInsightBrokerReferences(insight);
}

function assertContextReferences(
	context: DealContextRecord<BrokerId>,
	dealIds: ReadonlySet<string>
) {
	if (!dealIds.has(context.dealId)) {
		throw new Error(`Deal context references an unknown deal: ${context.dealId}.`);
	}

	assertContextBrokerReferences(context);
	assertContextHelpfulContacts(context);
}

export function validateDealRecords() {
	assertDealReferencesExist();
}
