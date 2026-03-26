import {
	MY_DEALS_NON_DEFAULT_VIEWS,
	type NonDefaultMyDealsView
} from '$lib/dashboard/my-deals-routes';
import { getMyDealsDetailEntries } from '../../../projection';
import { loadMyDealsDetailData } from '../../../route-data';

export const entries = () =>
	getMyDealsDetailEntries().flatMap(({ detailId }) =>
		MY_DEALS_NON_DEFAULT_VIEWS.map((view) => ({ view, detailId }))
	);

export const load = ({ params }) =>
	loadMyDealsDetailData(params.detailId, params.view as NonDefaultMyDealsView);
