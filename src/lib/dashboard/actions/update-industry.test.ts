import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	action: vi.fn()
}));

vi.mock('$lib/server/convex', () => ({
	api: {
		mutations: {
			updateDealIndustry: 'updateDealIndustry'
		}
	},
	createServerConvexClient: () => ({
		action: mocks.action
	})
}));

import { applyDealIndustryUpdate } from './update-industry';

const dealId = 'deal-doc-3m';

describe('applyDealIndustryUpdate', () => {
	beforeEach(() => {
		mocks.action.mockReset();
	});

	it('updates the deal industry and redirects back to the detail page', async () => {
		mocks.action.mockResolvedValue('updated');

		await expect(
			applyDealIndustryUpdate({
				request: new Request(`http://localhost/my-deals/detail/${dealId}?/updateIndustry`, {
					method: 'POST',
					body: new URLSearchParams({ dealId, industry: 'Hospitality' })
				}),
				url: new URL(`http://localhost/my-deals/detail/${dealId}?view=deals`)
			})
		).rejects.toMatchObject({
			status: 303,
			location: `/my-deals/detail/${dealId}?view=deals`
		});

			expect(mocks.action).toHaveBeenCalledWith('updateDealIndustry', {
				dealId,
				industry: 'Hospitality'
			});
	});

	it('rejects invalid industry values', async () => {
		await expect(
			applyDealIndustryUpdate({
				request: new Request(`http://localhost/my-deals/detail/${dealId}?/updateIndustry`, {
					method: 'POST',
					body: new URLSearchParams({ dealId, industry: 'NotReal' })
				}),
				url: new URL(`http://localhost/my-deals/detail/${dealId}`)
			})
		).rejects.toMatchObject({
			status: 400
		});

		expect(mocks.action).not.toHaveBeenCalled();
	});

	it('rejects requests without a canonical deal id', async () => {

		await expect(
			applyDealIndustryUpdate({
				request: new Request(`http://localhost/my-deals/detail/bad?/updateIndustry`, {
					method: 'POST',
					body: new URLSearchParams({ industry: 'Hospitality' })
				}),
				url: new URL('http://localhost/my-deals/detail/bad')
			})
		).rejects.toMatchObject({
			status: 400
		});

		expect(mocks.action).not.toHaveBeenCalled();
	});

	it('returns 404 when the deal id cannot be normalized', async () => {
		mocks.action.mockResolvedValue('not-found');

		await expect(
			applyDealIndustryUpdate({
				request: new Request('http://localhost/my-deals/detail/not-a-deal-id?/updateIndustry', {
					method: 'POST',
					body: new URLSearchParams({ dealId: 'not-a-deal-id', industry: 'Hospitality' })
				}),
				url: new URL('http://localhost/my-deals/detail/not-a-deal-id')
			})
		).rejects.toMatchObject({
			status: 404
		});
	});
});
