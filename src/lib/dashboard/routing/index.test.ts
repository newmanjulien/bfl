import { describe, expect, it } from 'vitest';
import type { DealId, InsightId } from '$lib/types/ids';
import { isDashboardNavRouteActive, resolveDashboardRoute } from './index';

const dealId = 'deal-doc-1' as DealId;
const insightId = 'insight-doc-1' as InsightId;

describe('resolveDashboardRoute', () => {
	it('resolves my deals routes with canonical default handling', () => {
		expect(
			resolveDashboardRoute({
				kind: 'my-deals-list',
				view: 'news'
			})
		).toBe('/my-deals');

		expect(
			resolveDashboardRoute({
				kind: 'my-deals-list',
				view: 'deals'
			})
		).toBe('/my-deals/deals');

		expect(
			resolveDashboardRoute({
				kind: 'my-deals-detail',
				dealId,
				view: 'news',
				tab: 'news'
			})
		).toBe(`/my-deals/detail/${dealId}`);

		expect(
			resolveDashboardRoute({
				kind: 'my-deals-detail',
				dealId,
				view: 'deals',
				tab: 'activity'
			})
		).toBe(`/my-deals/deals/detail/${dealId}?tab=activity`);
	});

	it('resolves all activity routes with canonical default handling', () => {
		expect(
			resolveDashboardRoute({
				kind: 'all-activity-list',
				view: 'deals'
			})
		).toBe('/all-activity');

		expect(
			resolveDashboardRoute({
				kind: 'all-activity-detail',
				dealId,
				view: 'need-support'
			})
		).toBe(`/all-activity/need-support/detail/${dealId}`);
	});

	it('resolves opportunities and since-last-meeting routes', () => {
		expect(resolveDashboardRoute({ kind: 'opportunities-list' })).toBe('/opportunities');
		expect(
			resolveDashboardRoute({
				kind: 'opportunities-detail',
				insightId
			})
		).toBe(`/opportunities/detail/${insightId}`);
		expect(resolveDashboardRoute({ kind: 'since-last-meeting' })).toBe('/since-last-meeting');
	});
});

describe('isDashboardNavRouteActive', () => {
	it('treats detail routes as active under their parent nav section', () => {
		expect(
			isDashboardNavRouteActive(
				{
					kind: 'my-deals-list',
					view: 'news'
				},
				{
					kind: 'my-deals-detail',
					dealId,
					view: 'deals',
					tab: 'activity'
				}
			)
		).toBe(true);

		expect(
			isDashboardNavRouteActive(
				{
					kind: 'all-activity-list',
					view: 'deals'
				},
				{
					kind: 'all-activity-detail',
					dealId,
					view: 'likely-out-of-date'
				}
			)
		).toBe(true);

		expect(
			isDashboardNavRouteActive(
				{
					kind: 'opportunities-list'
				},
				{
					kind: 'opportunities-detail',
					insightId
				}
			)
		).toBe(true);
	});

	it('requires an exact match for since-last-meeting', () => {
		expect(
			isDashboardNavRouteActive(
				{
					kind: 'since-last-meeting'
				},
				{
					kind: 'since-last-meeting'
				}
			)
		).toBe(true);

		expect(
			isDashboardNavRouteActive(
				{
					kind: 'since-last-meeting'
				},
				{
					kind: 'opportunities-list'
				}
			)
		).toBe(false);
	});
});
