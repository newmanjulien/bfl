import { describe, expect, it } from 'vitest';
import type { DealKey, InsightKey, MeetingKey } from '$lib/types/keys';
import { isDashboardNavRouteActive, resolveDashboardRoute } from './index';

const dealKey = 'deal-doc-1' as DealKey;
const insightKey = 'insight-doc-1' as InsightKey;
const meetingKey = 'meeting-doc-1' as MeetingKey;

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
				dealKey,
				view: 'news',
				tab: 'news'
			})
		).toBe(`/my-deals/detail/${dealKey}`);

		expect(
			resolveDashboardRoute({
				kind: 'my-deals-detail',
				dealKey,
				view: 'deals',
				tab: 'activity'
			})
		).toBe(`/my-deals/deals/detail/${dealKey}?tab=activity`);
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
				dealKey,
				view: 'need-support'
			})
		).toBe(`/all-activity/need-support/detail/${dealKey}`);
	});

	it('resolves opportunities and since-last-meeting routes', () => {
		expect(resolveDashboardRoute({ kind: 'opportunities-list', meetingKey: null })).toBe(
			'/opportunities'
		);
		expect(
			resolveDashboardRoute({
				kind: 'opportunities-list',
				meetingKey
			})
		).toBe('/opportunities?meetingKey=meeting-doc-1');
		expect(
			resolveDashboardRoute({
				kind: 'opportunities-detail',
				insightKey,
				meetingKey
			})
		).toBe(`/opportunities/detail/${insightKey}?meetingKey=meeting-doc-1`);
		expect(resolveDashboardRoute({ kind: 'since-last-meeting', meetingKey: null })).toBe(
			'/since-last-meeting'
		);
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
					dealKey,
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
					dealKey,
					view: 'likely-out-of-date'
				}
			)
		).toBe(true);

		expect(
			isDashboardNavRouteActive(
				{
					kind: 'opportunities-list',
					meetingKey: null
				},
				{
					kind: 'opportunities-detail',
					insightKey,
					meetingKey
				}
			)
		).toBe(true);
	});

	it('requires an exact match for since-last-meeting', () => {
		expect(
			isDashboardNavRouteActive(
				{
					kind: 'since-last-meeting',
					meetingKey: null
				},
				{
					kind: 'since-last-meeting',
					meetingKey
				}
			)
		).toBe(true);

		expect(
			isDashboardNavRouteActive(
				{
					kind: 'since-last-meeting',
					meetingKey: null
				},
				{
					kind: 'opportunities-list',
					meetingKey: null
				}
			)
		).toBe(false);
	});
});
