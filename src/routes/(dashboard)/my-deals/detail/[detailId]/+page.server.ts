import { error } from '@sveltejs/kit';
import { DASHBOARD_BACK_HREFS } from '$lib/dashboard/routes';
import { getMyDealsDetailEntries, getMyDealsDetailViewById } from '../../projection';

export const entries = () => getMyDealsDetailEntries();

export const load = ({ params }) => {
	const detail = getMyDealsDetailViewById(params.detailId);

	if (!detail) error(404, 'Not found');

	return {
		header: {
			mode: 'context',
			title: detail.hero.title,
			control: {
				kind: 'back-link',
				href: DASHBOARD_BACK_HREFS.myDeals,
				label: 'My deals'
			},
			actions: ['share'],
			extra: 'none'
		},
		hero: detail.hero,
		newsItems: detail.newsItems,
		activityItems: detail.activityItems,
		update: detail.update,
		rightRail: detail.rightRail
	};
};
