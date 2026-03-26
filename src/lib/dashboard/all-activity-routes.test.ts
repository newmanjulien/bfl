import { describe, expect, it } from 'vitest';
import {
	ALL_ACTIVITY_VIEW_OPTIONS,
	buildAllActivityDetailHref,
	buildAllActivityListHref,
	getAllActivityListLabel,
	getAllActivityViewLabel,
	isAllActivityDetailPath,
	isAllActivityListPath,
	isNonDefaultAllActivityView
} from './all-activity-routes';

describe('all-activity routes', () => {
	it.each(ALL_ACTIVITY_VIEW_OPTIONS)('builds stable list and detail paths for $id', ({ id, label }) => {
		const listHref = buildAllActivityListHref(id);
		const detailHref = buildAllActivityDetailHref('deal-3m', id);

		expect(getAllActivityViewLabel(id)).toBe(label);
		expect(isAllActivityListPath(listHref)).toBe(true);
		expect(getAllActivityListLabel(`${listHref}/`)).toBe(label);
		expect(isAllActivityDetailPath(detailHref)).toBe(true);
		expect(detailHref.endsWith('/detail/deal-3m')).toBe(true);
		expect(isNonDefaultAllActivityView(id)).toBe(id !== 'deals');
	});

	it('rejects unexpected values and unrelated paths', () => {
		expect(isNonDefaultAllActivityView('unexpected-view')).toBe(false);
		expect(isAllActivityListPath('/all-activity/detail/deal-3m')).toBe(false);
		expect(isAllActivityDetailPath('/all-activity')).toBe(false);
		expect(getAllActivityListLabel('/not-a-dashboard-path')).toBeNull();
	});
});
