import { describe, expect, it } from 'vitest';
import { getMyDealsHeaderUiScope } from './header-ui';

describe('my-deals header ui', () => {
	it('does not expose a header button on non-deals views', () => {
		expect(getMyDealsHeaderUiScope('news')).toBeNull();
	});

	it('exposes the add-deal button on the deals view', () => {
		expect(getMyDealsHeaderUiScope('deals')?.buttons?.map((button) => button.id)).toEqual([
			'add-deal'
		]);
	});
});
