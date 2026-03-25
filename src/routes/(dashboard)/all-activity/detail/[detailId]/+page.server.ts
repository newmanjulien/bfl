import { getAllActivityDetailEntries } from '../../projection';
import { loadAllActivityDetailData } from '../../route-data';

export const entries = () => getAllActivityDetailEntries();

export const load = ({ params }) => loadAllActivityDetailData(params.detailId);
