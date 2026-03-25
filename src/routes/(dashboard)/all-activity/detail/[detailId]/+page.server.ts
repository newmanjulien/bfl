import { error } from '@sveltejs/kit';
import { DASHBOARD_BACK_HREFS } from '$lib/dashboard/routes';
import { getAllActivityDetailEntries, getAllActivityDetailViewById } from '../../projection';

export const entries = () => getAllActivityDetailEntries();

export const load = ({ params }) => {
	const detail = getAllActivityDetailViewById(params.detailId);

	if (!detail) error(404, 'Not found');

	return {
		header: {
			mode: 'context',
			title: detail.hero.title,
			control: {
				kind: 'back-link',
				href: DASHBOARD_BACK_HREFS.allActivity,
				label: 'All activity'
			},
			actions: ['share'],
			extra: 'none'
		},
		hero: detail.hero,
		activityItems: detail.activityItems,
		orgChartRoot: detail.orgChartRoot,
		update: detail.update,
		rightRail: detail.rightRail
	};
};
