import { error } from '@sveltejs/kit';
import { getMyDealsDetailEntries, getMyDealsDetailViewById } from '../../projection';

export const entries = () => getMyDealsDetailEntries();

export const load = ({ params }) => {
	const detail = getMyDealsDetailViewById(params.detailId);

	if (!detail) error(404, 'Not found');

	return {
		hero: detail.hero,
		newsItems: detail.newsItems,
		activityItems: detail.activityItems,
		update: detail.update,
		rightRail: detail.rightRail
	};
};
