import { mutation } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import { v } from 'convex/values';
import type { OrgChartNodeRecord } from '../lib/domain/org-chart';

type LegacyOrgChartNode = {
	id: string;
	name: string;
	role: string;
	lastContactedByBrokerId: Id<'brokers'>;
	lastContactedOnIso: string;
	directReports?: LegacyOrgChartNode[];
};

type LegacyDealContext = {
	summary: string;
	claimedAtIso: string;
	orgChartRoot: LegacyOrgChartNode;
	helpfulContacts?: {
		id: string;
		name: string;
		title: string;
		company: string;
		linkedInUrl: string;
	}[];
};

type LegacyInsight = {
	orgChartRoot: LegacyOrgChartNode;
};

function isLegacyOrgChartNode(value: unknown): value is LegacyOrgChartNode {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return false;
	}

	const node = value as Record<string, unknown>;
	return (
		typeof node.id === 'string' &&
		typeof node.name === 'string' &&
		typeof node.role === 'string' &&
		typeof node.lastContactedByBrokerId === 'string' &&
		typeof node.lastContactedOnIso === 'string' &&
		(node.directReports === undefined || Array.isArray(node.directReports))
	);
}

function isLegacyDealContext(value: unknown): value is LegacyDealContext {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return false;
	}

	const context = value as Record<string, unknown>;
	return (
		typeof context.summary === 'string' &&
		typeof context.claimedAtIso === 'string' &&
		isLegacyOrgChartNode(context.orgChartRoot)
	);
}

function isLegacyInsight(value: unknown): value is LegacyInsight {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return false;
	}

	return isLegacyOrgChartNode((value as Record<string, unknown>).orgChartRoot);
}

function flattenLegacyOrgChartRoot(
	node: LegacyOrgChartNode,
	parentId?: string
): OrgChartNodeRecord<Id<'brokers'>>[] {
	return [
		{
			id: node.id,
			name: node.name,
			role: node.role,
			lastContactedByBrokerId: node.lastContactedByBrokerId,
			lastContactedOnIso: node.lastContactedOnIso,
			parentId
		},
		...(node.directReports ?? []).flatMap((child) => flattenLegacyOrgChartRoot(child, node.id))
	];
}

export const flattenLegacyOrgCharts = mutation({
	args: {},
	returns: v.object({
		dealsUpdated: v.number(),
		insightsUpdated: v.number()
	}),
	handler: async (ctx) => {
		const deals = await ctx.db.query('deals').collect();
		const insights = await ctx.db.query('insights').collect();
		let dealsUpdated = 0;
		let insightsUpdated = 0;

		for (const deal of deals) {
			if (!isLegacyDealContext((deal as Doc<'deals'> & { context?: unknown }).context)) {
				continue;
			}

			const legacyContext = (deal as Doc<'deals'> & { context: LegacyDealContext }).context;
			await ctx.db.patch(deal._id, {
				context: {
					summary: legacyContext.summary,
					claimedAtIso: legacyContext.claimedAtIso,
					orgChartNodes: flattenLegacyOrgChartRoot(legacyContext.orgChartRoot),
					helpfulContacts: legacyContext.helpfulContacts
				}
			});
			dealsUpdated += 1;
		}

		for (const insight of insights) {
			if (!isLegacyInsight(insight as Doc<'insights'> & { orgChartRoot?: unknown })) {
				continue;
			}

			const legacyInsight = insight as Doc<'insights'> & LegacyInsight;
			await ctx.db.replace(insight._id, {
				dealId: insight.dealId,
				meetingId: insight.meetingId,
				kind: insight.kind,
				title: insight.title,
				ownerBrokerId: insight.ownerBrokerId,
				collaboratorBrokerIds: insight.collaboratorBrokerIds,
				timeline: insight.timeline,
				orgChartNodes: flattenLegacyOrgChartRoot(legacyInsight.orgChartRoot)
			});
			insightsUpdated += 1;
		}

		return {
			dealsUpdated,
			insightsUpdated
		};
	}
});
