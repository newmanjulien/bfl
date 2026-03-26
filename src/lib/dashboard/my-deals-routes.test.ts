import { describe, expect, it } from 'vitest';
import {
	MY_DEALS_VIEW_OPTIONS,
	buildMyDealsDetailHref,
	buildMyDealsListHref,
	getMyDealsListLabel,
	getMyDealsViewLabel,
	isMyDealsDetailPath,
	isMyDealsListPath,
	isNonDefaultMyDealsView
} from './my-deals-routes';

describe('my-deals routes', () => {
	it.each(MY_DEALS_VIEW_OPTIONS)('builds stable list and detail paths for $id', ({ id, label }) => {
		const listHref = buildMyDealsListHref(id);
		const detailHref = buildMyDealsDetailHref('deal-3m', id);

		expect(getMyDealsViewLabel(id)).toBe(label);
		expect(isMyDealsListPath(listHref)).toBe(true);
		expect(getMyDealsListLabel(`${listHref}/`)).toBe(label);
		expect(isMyDealsDetailPath(detailHref)).toBe(true);
		expect(detailHref.endsWith('/detail/deal-3m')).toBe(true);
		expect(isNonDefaultMyDealsView(id)).toBe(id !== 'news');
	});

	it('rejects unexpected values and unrelated paths', () => {
		expect(isNonDefaultMyDealsView('unexpected-view')).toBe(false);
		expect(isMyDealsListPath('/my-deals/detail/deal-3m')).toBe(false);
		expect(isMyDealsDetailPath('/my-deals')).toBe(false);
		expect(getMyDealsListLabel('/not-a-dashboard-path')).toBeNull();
	});
});
