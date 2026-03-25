import { allActivityTableRows } from './projection';

export const load = () => {
	return {
		header: {
			mode: 'title',
			title: 'All activity',
			actions: ['share'],
			extra: 'all-activity-filters'
		},
		rows: allActivityTableRows
	};
};
