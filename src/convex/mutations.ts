import { action } from './_generated/server';
import { v } from 'convex/values';
import { makeFunctionReference, type FunctionReference } from 'convex/server';
import type { DealId } from '../lib/types/ids';
import type { DealIndustry } from '../lib/types/vocab';
import { dealIndustryValidator } from './validators';
import {
	type UpdateDealIndustryResult,
	updateDealIndustryResultValidator
} from './industryInternal';

const normalizeDealIdForUpdateReference = makeFunctionReference<
	'query',
	{ dealId: string },
	DealId | null
>('industryInternal:normalizeDealIdForUpdate') as unknown as FunctionReference<
	'query',
	'internal',
	{ dealId: string },
	DealId | null
>;

const updateDealIndustryByCanonicalIdReference = makeFunctionReference<
	'mutation',
	{ dealId: DealId; industry: DealIndustry },
	UpdateDealIndustryResult
>('industryInternal:updateDealIndustryByCanonicalId') as unknown as FunctionReference<
	'mutation',
	'internal',
	{ dealId: DealId; industry: DealIndustry },
	UpdateDealIndustryResult
>;

export const updateDealIndustry = action({
	args: {
		dealId: v.string(),
		industry: dealIndustryValidator
	},
	returns: updateDealIndustryResultValidator,
	handler: async (
		ctx,
		args: { dealId: string; industry: DealIndustry }
	): Promise<UpdateDealIndustryResult> => {
		const normalizedDealId: DealId | null = await ctx.runQuery(normalizeDealIdForUpdateReference, {
			dealId: args.dealId
		});

		if (!normalizedDealId) {
			return 'not-found';
		}

		return ctx.runMutation(updateDealIndustryByCanonicalIdReference, {
			dealId: normalizedDealId,
			industry: args.industry
		});
	}
});
