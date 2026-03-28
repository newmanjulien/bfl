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

const dealKey = 'deal-doc-3m';

describe('applyDealIndustryUpdate', () => {
	beforeEach(() => {
		mocks.action.mockReset();
	});

	it('updates the deal industry and redirects back to the detail page', async () => {
		mocks.action.mockResolvedValue('updated');

		await expect(
			applyDealIndustryUpdate({
				request: new Request(`http://localhost/my-deals/detail/${dealKey}?/updateIndustry`, {
					method: 'POST',
					body: new URLSearchParams({ dealKey, industry: 'Hospitality' })
				}),
				url: new URL(`http://localhost/my-deals/detail/${dealKey}?/updateIndustry`)
			})
		).rejects.toMatchObject({
			status: 303,
			location: `/my-deals/detail/${dealKey}`
		});

		expect(mocks.action).toHaveBeenCalledWith('updateDealIndustry', {
			dealKey,
			industry: 'Hospitality'
		});
	});

	it('preserves valid route query params while removing the named action marker', async () => {
		mocks.action.mockResolvedValue('updated');

		await expect(
			applyDealIndustryUpdate({
				request: new Request(
					`http://localhost/my-deals/detail/${dealKey}?/updateIndustry&tab=activity`,
					{
						method: 'POST',
						body: new URLSearchParams({ dealKey, industry: 'Hospitality' })
					}
				),
				url: new URL(`http://localhost/my-deals/detail/${dealKey}?/updateIndustry&tab=activity`)
			})
		).rejects.toMatchObject({
			status: 303,
			location: `/my-deals/detail/${dealKey}?tab=activity`
		});
	});

	it('rejects invalid industry values', async () => {
		await expect(
			applyDealIndustryUpdate({
				request: new Request(`http://localhost/my-deals/detail/${dealKey}?/updateIndustry`, {
					method: 'POST',
					body: new URLSearchParams({ dealKey, industry: 'NotReal' })
				}),
				url: new URL(`http://localhost/my-deals/detail/${dealKey}`)
			})
		).rejects.toMatchObject({
			status: 400
		});

		expect(mocks.action).not.toHaveBeenCalled();
	});

	it('rejects requests without a canonical deal key', async () => {

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

	it('returns 404 when the deal key cannot be resolved', async () => {
		mocks.action.mockResolvedValue('not-found');

		await expect(
			applyDealIndustryUpdate({
				request: new Request('http://localhost/my-deals/detail/not-a-deal-key?/updateIndustry', {
					method: 'POST',
					body: new URLSearchParams({ dealKey: 'not-a-deal-key', industry: 'Hospitality' })
				}),
				url: new URL('http://localhost/my-deals/detail/not-a-deal-key')
			})
		).rejects.toMatchObject({
			status: 404
		});
	});
});
