import { myDealsTableRows } from './projection';

export const load = () => {
	return {
		header: {
			mode: 'title',
			title: 'My deals',
			actions: ['share'],
			extra: 'add-deal'
		},
		rows: myDealsTableRows
	};
};
