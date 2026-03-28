import { describe, expect, it } from 'vitest';
import type { DealKey } from '$lib/types/keys';
import { buildMyDealsFeedTabs } from './feed-tabs';

const dealKey = 'deal-1' as DealKey;

describe('buildMyDealsFeedTabs', () => {
	it('keeps news as the default when a news item exists and splits linkedin items out', () => {
		const result = buildMyDealsFeedTabs(
			[
				{
					id: 'news-1',
					title: 'News item',
					kind: 'news',
					dateIso: '2026-03-27',
					navigation: { kind: 'none' }
				},
				{
					id: 'linkedin-1',
					title: 'LinkedIn item',
					kind: 'linkedin',
					dateIso: '2026-03-26',
					navigation: { kind: 'none' }
				}
			],
			[
				{
					id: 'watch-1',
					title: 'Watchlist item',
					kind: 'activity',
					dateIso: '2026-03-25',
					navigation: {
						kind: 'internal',
						route: {
							kind: 'my-deals-detail',
							dealKey,
							view: 'news',
							tab: 'activity'
						}
					}
				}
			]
		);

		expect(result).toEqual({
			initialTabId: 'news',
			newsItems: [
				{
					id: 'news-1',
					title: 'News item',
					kind: 'news',
					dateIso: '2026-03-27',
					navigation: { kind: 'none' }
				}
			],
			linkedinItems: [
				{
					id: 'linkedin-1',
					title: 'LinkedIn item',
					kind: 'linkedin',
					dateIso: '2026-03-26',
					navigation: { kind: 'none' }
				}
			]
		});
	});

	it('defaults to linkedin when news is empty and linkedin has items', () => {
		const result = buildMyDealsFeedTabs(
			[
				{
					id: 'linkedin-1',
					title: 'LinkedIn item',
					kind: 'linkedin',
					dateIso: '2026-03-26',
					navigation: { kind: 'none' }
				}
			],
			[
				{
					id: 'watch-1',
					title: 'Watchlist item',
					kind: 'activity',
					dateIso: '2026-03-25',
					navigation: {
						kind: 'internal',
						route: {
							kind: 'my-deals-detail',
							dealKey,
							view: 'news',
							tab: 'activity'
						}
					}
				}
			]
		);

		expect(result.initialTabId).toBe('linkedin');
	});

	it('defaults to watchlist when news and linkedin are empty but watchlist has items', () => {
		const result = buildMyDealsFeedTabs([], [
			{
				id: 'watch-1',
				title: 'Watchlist item',
				kind: 'activity',
				dateIso: '2026-03-25',
				navigation: {
					kind: 'internal',
					route: {
						kind: 'my-deals-detail',
						dealKey,
						view: 'news',
						tab: 'activity'
					}
				}
			}
		]);

		expect(result.initialTabId).toBe('watchlist');
	});

	it('falls back to news when all tabs are empty', () => {
		const result = buildMyDealsFeedTabs([], []);

		expect(result.initialTabId).toBe('news');
	});
});
