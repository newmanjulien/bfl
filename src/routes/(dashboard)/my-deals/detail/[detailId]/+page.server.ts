import { getMyDealsDetailEntries } from '../../projection';
import { loadMyDealsDetailData } from '../../route-data';

export const entries = () => getMyDealsDetailEntries();

export const load = ({ params }) => loadMyDealsDetailData(params.detailId);
