import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import type { DetailRightRailData } from '$lib/dashboard/detail-rail-model';
import DetailRightRail from './DetailRightRail.svelte';

const detailRightRailData: DetailRightRailData = {
	sections: [
		{
			id: 'deal-overview',
			kind: 'rows',
			rows: [
				{
					id: 'activity-level',
					label: 'Activity',
					kind: 'activity-level',
					activityLevel: 'high'
				},
				{
					id: 'industry',
					label: 'Industry',
					kind: 'text',
					value: 'Industrials'
				}
			]
		}
	]
};

describe('detail right rail', () => {
	it('renders centered shared row shells for activity and industry rows', () => {
		const html = render(DetailRightRail, {
			props: {
				data: detailRightRailData
			}
		}).body;

		expect(html).toContain('grid items-center grid-cols-[4.25rem_minmax(0,1fr)] gap-2.5');
		expect(html).toContain('Activity');
		expect(html).toContain('High');
		expect(html).toContain('aria-haspopup="dialog"');
		expect(html).toContain('Industrials');
		expect(html).not.toContain('<select');
	});
});
