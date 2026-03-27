import { describe, expect, it } from 'vitest';
import {
	isIsoDate,
	isIsoDateTime,
	parseIsoDate,
	parseIsoDateArray,
	parseIsoDateTime,
	parseOptionalIsoDateTime
} from './dates';

describe('dates', () => {
	it('accepts canonical ISO dates', () => {
		expect(isIsoDate('2026-03-27')).toBe(true);
		expect(parseIsoDate('2026-03-27')).toBe('2026-03-27');
		expect(parseIsoDateArray(['2026-03-20', '2026-03-27'])).toEqual([
			'2026-03-20',
			'2026-03-27'
		]);
	});

	it('rejects non-canonical or invalid ISO dates', () => {
		expect(isIsoDate('2026-3-27')).toBe(false);
		expect(isIsoDate('2026-02-30')).toBe(false);
		expect(() => parseIsoDate('2026-3-27', 'meetingDate')).toThrow(
			'Invalid ISO date at "meetingDate": "2026-3-27".'
		);
		expect(() => parseIsoDate('2026-02-30', 'meetingDate')).toThrow(
			'Invalid ISO date at "meetingDate": "2026-02-30".'
		);
	});

	it('accepts canonical UTC ISO date-times', () => {
		expect(isIsoDateTime('2026-03-10T09:00:00Z')).toBe(true);
		expect(isIsoDateTime('2026-03-10T09:00:00.123Z')).toBe(true);
		expect(parseIsoDateTime('2026-03-10T09:00:00Z')).toBe('2026-03-10T09:00:00Z');
		expect(parseOptionalIsoDateTime(undefined)).toBeUndefined();
	});

	it('rejects non-canonical or invalid ISO date-times', () => {
		expect(isIsoDateTime('2026-03-10T09:00:00+02:00')).toBe(false);
		expect(isIsoDateTime('2026-03-10 09:00:00Z')).toBe(false);
		expect(isIsoDateTime('2026-03-10T24:00:00Z')).toBe(false);
		expect(() => parseIsoDateTime('2026-03-10T09:00:00+02:00', 'claimedAtIso')).toThrow(
			'Invalid ISO date-time at "claimedAtIso": "2026-03-10T09:00:00+02:00".'
		);
		expect(() => parseIsoDateTime('2026-03-10T24:00:00Z', 'claimedAtIso')).toThrow(
			'Invalid ISO date-time at "claimedAtIso": "2026-03-10T24:00:00Z".'
		);
	});
});
