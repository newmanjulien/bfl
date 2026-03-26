import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { loadAllActivityListData } from './route-data';
import AllActivityPage from './AllActivityPage.svelte';
import LikelyOutOfDateTable from './LikelyOutOfDateTable.svelte';

describe('all-activity page', () => {
	it('switches between the default table and the likely-out-of-date selection table', () => {
		const dealsHtml = render(AllActivityPage, {
			props: {
				data: loadAllActivityListData('deals')
			}
		}).body;
		const staleHtml = render(AllActivityPage, {
			props: {
				data: loadAllActivityListData('likely-out-of-date')
			}
		}).body;

		expect(dealsHtml).toContain('data-interactive-rows="true"');
		expect(dealsHtml).not.toContain('data-table-select-header');
		expect(dealsHtml).not.toContain('data-likely-out-of-date-info-bar');

		expect(staleHtml).toContain('data-interactive-rows="false"');
		expect(staleHtml).toContain('data-table-select-header');
		expect(staleHtml).toContain('data-likely-out-of-date-info-bar');
		expect((staleHtml.match(/<a[^>]*data-table-row/g) ?? []).length).toBe(0);
	});

	it('keeps the selection-table shell when there are no stale rows to show', () => {
		const html = render(LikelyOutOfDateTable, {
			props: {
				rows: []
			}
		}).body;

		expect(html).toContain('data-table-select-header');
		expect(html).toContain('data-table-empty');
		expect(html).not.toContain('data-likely-out-of-date-info-bar');
	});
});
