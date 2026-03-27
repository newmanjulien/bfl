import { describe, expect, it } from 'vitest';
import type { DealId, InsightId } from '$lib/types/ids';
import {
	isDashboardNavRouteActive,
	matchDashboardRoute,
	resolveDashboardRoute
} from './index';

const dealId = 'deal-doc-1' as DealId;
const insightId = 'insight-doc-1' as InsightId;

describe('dashboard routing', () => {
	it('round trips my deals list routes with canonical default handling', () => {
		expect(
			resolveDashboardRoute({
				kind: 'my-deals-list',
				view: 'news'
			})
		).toBe('/my-deals');
		expect(matchDashboardRoute('/my-deals')).toEqual({
			kind: 'my-deals-list',
			view: 'news'
		});

		expect(
			resolveDashboardRoute({
				kind: 'my-deals-list',
				view: 'deals'
			})
		).toBe('/my-deals/deals');
		expect(matchDashboardRoute('/my-deals/deals')).toEqual({
			kind: 'my-deals-list',
			view: 'deals'
		});
	});

	it('round trips my deals detail routes and restores the default tab when omitted', () => {
		expect(
			resolveDashboardRoute({
				kind: 'my-deals-detail',
				dealId,
				view: 'news',
				tab: 'news'
			})
		).toBe(`/my-deals/detail/${dealId}`);
		expect(matchDashboardRoute(`/my-deals/detail/${dealId}`)).toEqual({
			kind: 'my-deals-detail',
			dealId,
			view: 'news',
			tab: 'news'
		});

		expect(
			resolveDashboardRoute({
				kind: 'my-deals-detail',
				dealId,
				view: 'deals',
				tab: 'activity'
			})
		).toBe(`/my-deals/deals/detail/${dealId}?tab=activity`);
		expect(
			matchDashboardRoute(new URL(`http://localhost/my-deals/deals/detail/${dealId}?tab=activity`))
		).toEqual({
			kind: 'my-deals-detail',
			dealId,
			view: 'deals',
			tab: 'activity'
		});
	});

	it('round trips all activity routes with canonical default view handling', () => {
		expect(
			resolveDashboardRoute({
				kind: 'all-activity-list',
				view: 'deals'
			})
		).toBe('/all-activity');
		expect(matchDashboardRoute('/all-activity')).toEqual({
			kind: 'all-activity-list',
			view: 'deals'
		});

		expect(
			resolveDashboardRoute({
				kind: 'all-activity-detail',
				dealId,
				view: 'need-support'
			})
		).toBe(`/all-activity/need-support/detail/${dealId}`);
		expect(matchDashboardRoute(`/all-activity/need-support/detail/${dealId}`)).toEqual({
			kind: 'all-activity-detail',
			dealId,
			view: 'need-support'
		});
	});

	it('round trips opportunities and since-last-meeting routes', () => {
		expect(resolveDashboardRoute({ kind: 'opportunities-list' })).toBe('/opportunities');
		expect(matchDashboardRoute('/opportunities')).toEqual({
			kind: 'opportunities-list'
		});

		expect(
			resolveDashboardRoute({
				kind: 'opportunities-detail',
				insightId
			})
		).toBe(`/opportunities/detail/${insightId}`);
		expect(matchDashboardRoute(`/opportunities/detail/${insightId}`)).toEqual({
			kind: 'opportunities-detail',
			insightId
		});

		expect(resolveDashboardRoute({ kind: 'since-last-meeting' })).toBe('/since-last-meeting');
		expect(matchDashboardRoute('/since-last-meeting')).toEqual({
			kind: 'since-last-meeting'
		});
	});

	it('returns null for unknown or malformed paths', () => {
		expect(matchDashboardRoute('/')).toBeNull();
		expect(matchDashboardRoute('/my-deals/news')).toBeNull();
		expect(matchDashboardRoute('/all-activity/deals')).toBeNull();
		expect(matchDashboardRoute('/opportunities/detail')).toBeNull();
	});
});

describe('dashboard nav activation', () => {
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
