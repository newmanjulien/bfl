import { describe, expect, it } from 'vitest';
import {
	getMyDealsDetailViewById,
	getMyDealsNewsItems,
	getMyDealsTableRowsForView
} from './projection';

function getWeekStartIso(isoDate: string) {
	const date = new Date(`${isoDate}T00:00:00Z`);
	const day = date.getUTCDay();
	const daysSinceMonday = day === 0 ? 6 : day - 1;

	date.setUTCDate(date.getUTCDate() - daysSinceMonday);
	return date.toISOString().slice(0, 10);
}

describe('my-deals projection', () => {
	it('builds deals rows with view-aware detail hrefs', () => {
		const rows = getMyDealsTableRowsForView('deals');
		const detailRows = rows.filter((row) => row.navigation.kind === 'detail');

		expect(detailRows.length).toBeGreaterThan(0);
		expect(
			detailRows.every((row) => row.navigation.href.startsWith('/my-deals/deals/detail/'))
		).toBe(true);
	});

	it('keeps news items within the latest week and in reverse chronological order', () => {
		const newsItems = getMyDealsNewsItems();

		expect(newsItems.length).toBeGreaterThan(0);

		const weekStartIso = getWeekStartIso(newsItems[0].publishedOnIso);
		const sortedNewsIds = [...newsItems]
			.sort(
				(left, right) =>
					right.publishedOnIso.localeCompare(left.publishedOnIso) || left.id.localeCompare(right.id)
			)
			.map((item) => item.id);

		expect(newsItems.every((item) => getWeekStartIso(item.publishedOnIso) === weekStartIso)).toBe(
			true
		);
		expect(newsItems.map((item) => item.id)).toEqual(sortedNewsIds);
	});

	it('builds overview-only detail views with canonical deal numbers', () => {
		const detail = getMyDealsDetailViewById('deal-3m');

		if (!detail) {
			throw new Error('Expected a my-deals detail view for deal-3m.');
		}

		expect(detail.hero.dealNumber).toBe(74);
		expect(detail.rightRail.sections.map((section) => section.id)).toEqual(['deal-overview']);
	});
});
