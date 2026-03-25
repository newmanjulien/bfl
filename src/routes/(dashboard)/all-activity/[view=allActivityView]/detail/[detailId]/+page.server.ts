import {
	ALL_ACTIVITY_NON_DEFAULT_VIEWS,
	type NonDefaultAllActivityView
} from '$lib/dashboard/all-activity-routes';
import { getAllActivityDetailEntries } from '../../../projection';
import { loadAllActivityDetailData } from '../../../route-data';

export const entries = () =>
	getAllActivityDetailEntries().flatMap(({ detailId }) =>
		ALL_ACTIVITY_NON_DEFAULT_VIEWS.map((view) => ({ view, detailId }))
	);

export const load = ({ params }) =>
	loadAllActivityDetailData(params.detailId, params.view as NonDefaultAllActivityView);
