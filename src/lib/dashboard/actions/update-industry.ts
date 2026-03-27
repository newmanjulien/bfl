import { error, redirect } from '@sveltejs/kit';
import { api, createServerConvexClient } from '$lib/server/convex';
import { DEAL_INDUSTRIES, type DealIndustry } from '$lib/types/vocab';

function isDealIndustry(value: string): value is DealIndustry {
	return DEAL_INDUSTRIES.includes(value as DealIndustry);
}

function resolvePostActionRedirectUrl(url: URL) {
	const redirectUrl = new URL(url);

	for (const key of [...redirectUrl.searchParams.keys()]) {
		if (key.startsWith('/')) {
			redirectUrl.searchParams.delete(key);
		}
	}

	return `${redirectUrl.pathname}${redirectUrl.search}`;
}

export async function applyDealIndustryUpdate(params: {
	request: Request;
	url: URL;
}) {
	const formData = await params.request.formData();
	const dealId = formData.get('dealId');
	const industry = formData.get('industry');

	if (typeof dealId !== 'string' || dealId.length === 0) {
		throw error(400, 'Invalid deal id.');
	}

	if (typeof industry !== 'string' || !isDealIndustry(industry)) {
		throw error(400, 'Invalid industry selection.');
	}

	const result = await createServerConvexClient().action(api.mutations.updateDealIndustry, {
		dealId,
		industry
	});

	if (result === 'not-found') {
		throw error(404, 'Not found');
	}

	throw redirect(303, resolvePostActionRedirectUrl(params.url));
}
