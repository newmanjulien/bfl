import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { loadMyDealsListData } from './route-data';
import MyDealsPage from './MyDealsPage.svelte';

describe('my-deals page', () => {
	it('switches between the news tabs and the deals table', () => {
		const newsHtml = render(MyDealsPage, {
			props: {
				data: loadMyDealsListData()
			}
		}).body;
		const dealsHtml = render(MyDealsPage, {
			props: {
				data: loadMyDealsListData('deals')
			}
		}).body;

		expect(newsHtml.match(/role="tab"/g) ?? []).toHaveLength(2);
		expect(newsHtml.match(/role="tabpanel"/g) ?? []).toHaveLength(1);
		expect(newsHtml).not.toContain('aria-label="My deals table"');

		expect(dealsHtml).toContain('aria-label="My deals table"');
		expect(dealsHtml).toContain('data-interactive-rows="true"');
		expect(dealsHtml).not.toContain('role="tab"');
	});
});
