import type {
	DealActivityRecord,
	DealBrokerLinkRecord,
	DealContextRecord,
	DealHelpfulContactRecord,
	DealInsightRecord,
	DealNewsRecord
} from '$lib/domain/deals';
import type { OrgChartContactNode } from '$lib/domain/org-chart';
import { brokersById, type BrokerId } from '../reference/records';
import {
	dealActivities,
	dealBrokerLinks,
	dealContexts,
	dealNews,
	deals
} from './records';

function assertUniqueValue(value: string | number, values: Set<string | number>, context: string) {
	if (values.has(value)) {
		throw new Error(`Duplicate ${context} detected: ${String(value)}.`);
	}

	values.add(value);
}

function hasBrokerId(brokerId: string): brokerId is BrokerId {
	return brokerId in brokersById;
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

function assertDealInsights(
	insights: readonly DealInsightRecord<BrokerId>[] | undefined,
	dealId: string,
	dealIds: ReadonlySet<string>,
	dealInsightIdValues: Set<string | number>
) {
	for (const insight of insights ?? []) {
		assertUniqueValue(insight.id, dealInsightIdValues, 'deal insight id');

		if (insight.dealId !== dealId) {
			throw new Error(
				`Deal ${dealId} contains insight ${insight.id} with mismatched dealId ${insight.dealId}.`
			);
		}

		assertInsightReferences(insight, dealIds);
	}
}

function assertDealReferencesExist() {
	const dealIds = new Set(deals.map((deal) => deal.dealId));
	const dealNumberValues = new Set<string | number>();
	const dealIdValues = new Set<string | number>();
	const dealBrokerLinkIdValues = new Set<string | number>();
	const dealActivityIdValues = new Set<string | number>();
	const dealNewsIdValues = new Set<string | number>();
	const dealInsightIdValues = new Set<string | number>();
	const dealContextDealIdValues = new Set<string | number>();

	for (const deal of deals) {
		assertUniqueValue(deal.dealId, dealIdValues, 'dealId');
		assertUniqueValue(deal.dealNumber, dealNumberValues, 'dealNumber');
		assertDealInsights(deal.insights, deal.dealId, dealIds, dealInsightIdValues);
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

	for (const context of dealContexts) {
		assertUniqueValue(context.dealId, dealContextDealIdValues, 'deal context dealId');
		assertContextReferences(context, dealIds);
	}

	for (const dealId of dealIds) {
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
