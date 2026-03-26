import {
	MY_DEALS_NON_DEFAULT_VIEWS,
	type NonDefaultMyDealsView
} from '$lib/dashboard/my-deals-routes';
import { loadMyDealsListData } from '../route-data';

export const entries = () => MY_DEALS_NON_DEFAULT_VIEWS.map((view) => ({ view }));

export const load = ({ params }) => loadMyDealsListData(params.view as NonDefaultMyDealsView);
