import { error } from '@sveltejs/kit';
import { DASHBOARD_BACK_HREFS } from '$lib/dashboard/routes';
import {
	getOpportunityDetailEntries,
	getOpportunityDetailViewById
} from '../../projection';

export const entries = () => getOpportunityDetailEntries();

export const load = ({ params }) => {
	const detail = getOpportunityDetailViewById(params.detailId);

	if (!detail) error(404, 'Not found');

	return {
		header: {
			mode: 'context',
			title: detail.hero.title,
			control: {
				kind: 'back-link',
				href: DASHBOARD_BACK_HREFS.opportunities,
				label: 'Opportunities & risks'
			},
			actions: ['share', 'broker-switch'],
			extra: 'none'
		},
		hero: detail.hero,
		activityItems: detail.activityItems,
		orgChartRoot: detail.orgChartRoot,
		update: detail.update,
		rightRail: detail.rightRail
	};
};
