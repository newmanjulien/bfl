import { describe, expect, it } from 'vitest';
import { getLikelyOutOfDateHeaderUiScope } from './likely-out-of-date-header';

describe('likely-out-of-date header ui', () => {
	it('does not expose a header button when no rows are selected', () => {
		expect(getLikelyOutOfDateHeaderUiScope(0)).toBeNull();
	});

	it('exposes the ask-for-update button when one or more rows are selected', () => {
		expect(getLikelyOutOfDateHeaderUiScope(1)?.buttons?.map((button) => button.id)).toEqual([
			'ask-for-update'
		]);
		expect(getLikelyOutOfDateHeaderUiScope(3)?.buttons?.map((button) => button.id)).toEqual([
			'ask-for-update'
		]);
	});
});
