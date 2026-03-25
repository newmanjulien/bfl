import { error } from '@sveltejs/kit';
import { getAllActivityDetailEntries, getAllActivityDetailViewById } from '../../projection';

export const entries = () => getAllActivityDetailEntries();

export const load = ({ params }) => {
	const detail = getAllActivityDetailViewById(params.detailId);

	if (!detail) error(404, 'Not found');

	return {
		hero: detail.hero,
		activityItems: detail.activityItems,
		orgChartRoot: detail.orgChartRoot,
		update: detail.update,
		rightRail: detail.rightRail
	};
};
