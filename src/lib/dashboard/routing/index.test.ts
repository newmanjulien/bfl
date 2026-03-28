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
		expect(resolveDashboardRoute({ kind: 'opportunities-list', meetingId: null })).toBe(
			'/opportunities'
		);
		expect(
			resolveDashboardRoute({
				kind: 'opportunities-list',
				meetingId: 'meeting-doc-1'
			})
		).toBe('/opportunities?meetingId=meeting-doc-1');
		expect(
			resolveDashboardRoute({
				kind: 'opportunities-detail',
				insightId,
				meetingId: 'meeting-doc-1'
			})
		).toBe(`/opportunities/detail/${insightId}?meetingId=meeting-doc-1`);
		expect(resolveDashboardRoute({ kind: 'since-last-meeting', meetingId: null })).toBe(
			'/since-last-meeting'
		);
		expect(
			resolveDashboardRoute({
				kind: 'since-last-meeting-detail',
				dealId,
				meetingId: null
			})
		).toBe(`/since-last-meeting/detail/${dealId}`);
		expect(
			resolveDashboardRoute({
				kind: 'since-last-meeting-detail',
				dealId,
				meetingId: 'meeting-doc-1'
			})
		).toBe(`/since-last-meeting/detail/${dealId}?meetingId=meeting-doc-1`);
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
					kind: 'opportunities-list',
					meetingId: null
				},
				{
					kind: 'opportunities-detail',
					insightId,
					meetingId: 'meeting-doc-1'
				}
			)
		).toBe(true);
	});

	it('treats since-last-meeting detail routes as active under the same nav section', () => {
		expect(
			isDashboardNavRouteActive(
				{
					kind: 'since-last-meeting',
					meetingId: null
				},
				{
					kind: 'since-last-meeting-detail',
					dealId,
					meetingId: 'meeting-doc-1'
				}
			)
		).toBe(true);

		expect(
			isDashboardNavRouteActive(
				{
					kind: 'since-last-meeting',
					meetingId: null
				},
				{
					kind: 'since-last-meeting',
					meetingId: 'meeting-doc-1'
				}
			)
		).toBe(true);

		expect(
			isDashboardNavRouteActive(
				{
					kind: 'since-last-meeting',
					meetingId: null
				},
				{
					kind: 'opportunities-list',
					meetingId: null
				}
			)
		).toBe(false);
	});
});
