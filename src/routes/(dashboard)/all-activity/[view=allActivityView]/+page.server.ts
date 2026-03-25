import {
	ALL_ACTIVITY_NON_DEFAULT_VIEWS,
	type NonDefaultAllActivityView
} from '$lib/dashboard/all-activity-routes';
import { loadAllActivityListData } from '../route-data';

export const entries = () => ALL_ACTIVITY_NON_DEFAULT_VIEWS.map((view) => ({ view }));

export const load = ({ params }) =>
	loadAllActivityListData(params.view as NonDefaultAllActivityView);
