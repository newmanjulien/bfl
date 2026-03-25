import { describe, expect, it } from 'vitest';
import { mockDb } from '$lib/mock-db';

describe('mockDb selectors', () => {
	it('exposes a grouped query-only public db object', () => {
		expect('records' in mockDb).toBe(false);
		expect('queries' in mockDb).toBe(false);
		expect(Object.keys(mockDb).sort()).toEqual([
			'activities',
			'brokers',
			'contexts',
			'deals',
			'forecasts',
			'insights',
			'meetings',
			'news'
		]);
	});

	it('returns immutable snapshots instead of live canonical records', () => {
		const deal = mockDb.deals.requireById('deal-3m');
		const dealAgain = mockDb.deals.requireById('deal-3m');
		const broker = mockDb.brokers.getById('julien');
		const brokerAgain = mockDb.brokers.getById('julien');
		const meetingDates = mockDb.meetings.listDateIsos();
		const meetingDatesAgain = mockDb.meetings.listDateIsos();

		expect(deal).not.toBe(dealAgain);
		expect(broker).not.toBe(brokerAgain);
		expect(meetingDates).not.toBe(meetingDatesAgain);
		expect(Object.isFrozen(deal)).toBe(true);
		expect(Object.isFrozen(deal.activityTrend?.points ?? [])).toBe(true);
		expect(Object.isFrozen(broker)).toBe(true);
		expect(Object.isFrozen(meetingDates)).toBe(true);
		expect(() => {
			(deal as { dealName: string }).dealName = 'Mutated deal';
		}).toThrow();
		expect(() => {
			(broker as { name: string }).name = 'Mutated broker';
		}).toThrow();
		expect(mockDb.deals.requireById('deal-3m').dealName).toBe('3M deal');
		expect(mockDb.brokers.getById('julien').name).toBe('Julien Newman');
		expect(mockDb.meetings.listDateIsos()).toContain('2026-01-12');
	});
});
