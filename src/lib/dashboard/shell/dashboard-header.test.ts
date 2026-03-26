import { describe, expect, it } from 'vitest';
import { DASHBOARD_STATIC_ROUTES } from '$lib/dashboard/routes';
import { loadAllActivityDetailData, loadAllActivityListData } from '../../../routes/(dashboard)/all-activity/route-data';
import { loadMyDealsDetailData, loadMyDealsListData } from '../../../routes/(dashboard)/my-deals/route-data';
import { getDashboardHeader } from './dashboard-header';

function expectCurrentMenuOption(
	header: ReturnType<typeof getDashboardHeader>,
	title: string,
	label: string,
	href: string
) {
	if (!header || header.leading.kind !== 'title-menu') {
		throw new Error('Expected a title-menu header.');
	}

	expect(header.leading.title).toBe(title);
	expect(header.leading.menu.activeLabel).toBe(label);
	expect(header.leading.menu.options.filter((option) => option.current)).toEqual([
		expect.objectContaining({ href, label })
	]);
}

describe('dashboard header', () => {
	it.each([
		{
			pathname: DASHBOARD_STATIC_ROUTES['since-last-meeting'],
			title: 'Since last meeting'
		},
		{
			pathname: DASHBOARD_STATIC_ROUTES.opportunities,
			title: 'Opportunities & risks'
		}
	])('uses meeting-date controls for $pathname', ({ pathname, title }) => {
		expect(getDashboardHeader(pathname)).toEqual({
			leading: {
				kind: 'control-title',
				title,
				control: { kind: 'meeting-date' }
			},
			actions: ['share', 'broker-switch']
		});
	});

	it('derives list headers from route data', () => {
		const myDealsNewsHeader = getDashboardHeader('/my-deals', loadMyDealsListData());
		const myDealsDealsHeader = getDashboardHeader('/my-deals/deals', loadMyDealsListData('deals'));
		const allActivityHeader = getDashboardHeader(
			'/all-activity/need-support',
			loadAllActivityListData('need-support')
		);

		expectCurrentMenuOption(myDealsNewsHeader, 'My deals', "This week's news", '/my-deals');
		expect(myDealsNewsHeader?.actions).toEqual(['share']);

		expectCurrentMenuOption(myDealsDealsHeader, 'My deals', 'Deals', '/my-deals/deals');
		expect(myDealsDealsHeader?.actions).toEqual(['share']);

		expectCurrentMenuOption(
			allActivityHeader,
			'All activity',
			'Need support',
			'/all-activity/need-support'
		);
		expect(allActivityHeader?.actions).toEqual(['share']);
	});

	it.each([
		{
			pathname: '/all-activity/detail/deal-3m',
			data: loadAllActivityDetailData('deal-3m'),
			href: '/all-activity',
			label: 'Deals'
		},
		{
			pathname: '/all-activity/duplicated-work/detail/deal-3m',
			data: loadAllActivityDetailData('deal-3m', 'duplicated-work'),
			href: '/all-activity/duplicated-work',
			label: 'Duplicated work'
		},
		{
			pathname: '/my-deals/detail/deal-3m',
			data: loadMyDealsDetailData('deal-3m'),
			href: '/my-deals',
			label: "This week's news"
		},
		{
			pathname: '/my-deals/deals/detail/deal-3m',
			data: loadMyDealsDetailData('deal-3m', 'deals'),
			href: '/my-deals/deals',
			label: 'Deals'
		}
	])('keeps detail back links aligned for $pathname', ({ pathname, data, href, label }) => {
		const header = getDashboardHeader(pathname, data);

		if (!header || header.leading.kind !== 'control-title') {
			throw new Error('Expected a control-title header.');
		}

		expect(header.leading.title).toBe('3M deal');
		expect(header.leading.control).toEqual({
			kind: 'back-link',
			href,
			label
		});
		expect(header.actions).toEqual(['share']);
	});
});
