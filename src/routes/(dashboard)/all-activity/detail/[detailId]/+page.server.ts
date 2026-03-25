import { error } from '@sveltejs/kit';
import {
	buildAllActivityListHref,
	getAllActivityDetailEntries,
	getAllActivityDetailViewById,
	parseAllActivityView
} from '../../projection';

export const entries = () => getAllActivityDetailEntries();

export const load = ({ params, url }) => {
	const detail = getAllActivityDetailViewById(params.detailId);
	const selectedView = parseAllActivityView(url.searchParams.get('view'));

	if (!detail) error(404, 'Not found');

	return {
		hero: detail.hero,
		activityItems: detail.activityItems,
		orgChartRoot: detail.orgChartRoot,
		update: detail.update,
		rightRail: detail.rightRail,
		headerBackHref: buildAllActivityListHref(selectedView)
	};
};
