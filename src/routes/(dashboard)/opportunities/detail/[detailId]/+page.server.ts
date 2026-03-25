import { error } from '@sveltejs/kit';
import {
	getOpportunityDetailEntries,
	getOpportunityDetailViewById
} from '../../projection';

export const entries = () => getOpportunityDetailEntries();

export const load = ({ params }) => {
	const detail = getOpportunityDetailViewById(params.detailId);

	if (!detail) error(404, 'Not found');

	return {
		hero: detail.hero,
		kind: detail.kind,
		activityItems: detail.activityItems,
		orgChartRoot: detail.orgChartRoot,
		update: detail.update,
		rightRail: detail.rightRail
	};
};
