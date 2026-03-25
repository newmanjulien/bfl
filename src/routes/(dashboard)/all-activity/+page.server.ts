import { allActivityTableRows } from './projection';

export const load = () => {
	return {
		rows: allActivityTableRows
	};
};
