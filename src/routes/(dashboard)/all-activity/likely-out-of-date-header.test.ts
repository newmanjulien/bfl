import { describe, expect, it } from 'vitest';
import {
	getLikelyOutOfDateHeaderUiScope,
	LIKELY_OUT_OF_DATE_HEADER_SCOPE_ID
} from './likely-out-of-date-header';

describe('likely-out-of-date header ui', () => {
	it('does not expose a header button when no rows are selected', () => {
		expect(getLikelyOutOfDateHeaderUiScope(0)).toBeNull();
	});

	it('exposes the ask-for-update button when one or more rows are selected', () => {
		expect(LIKELY_OUT_OF_DATE_HEADER_SCOPE_ID).toBe('all-activity-likely-out-of-date');
		expect(getLikelyOutOfDateHeaderUiScope(1)).toEqual({
			buttons: [{ id: 'ask-for-update', label: 'Ask for update' }]
		});
		expect(getLikelyOutOfDateHeaderUiScope(3)).toEqual({
			buttons: [{ id: 'ask-for-update', label: 'Ask for update' }]
		});
	});
});
