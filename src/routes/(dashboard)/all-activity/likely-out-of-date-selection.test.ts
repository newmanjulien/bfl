import { describe, expect, it } from 'vitest';
import { getStaleLikelyOutOfDateSelectionRowIds } from './likely-out-of-date-selection';

describe('likely-out-of-date selection', () => {
	it('returns no stale ids when every selected row is still visible', () => {
		expect(
			getStaleLikelyOutOfDateSelectionRowIds(new Set(['deal-3m', 'deal-fedex']), [
				{ id: 'deal-3m' },
				{ id: 'deal-fedex' },
				{ id: 'deal-honeywell' }
			])
		).toEqual([]);
	});

	it('returns selected ids that are no longer present in the visible rows', () => {
		expect(
			getStaleLikelyOutOfDateSelectionRowIds(
				new Set(['deal-honeywell', 'deal-fedex', 'deal-3m']),
				[{ id: 'deal-honeywell' }]
			)
		).toEqual(['deal-fedex', 'deal-3m']);
	});
});
