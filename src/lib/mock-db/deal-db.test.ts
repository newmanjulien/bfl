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
			'meetings',
			'news'
		]);
	});

	it('returns immutable snapshots instead of live canonical records', () => {
		const deal = mockDb.deals.requireById('deal-3m');
		const dealAgain = mockDb.deals.requireById('deal-3m');
		const honeywell = mockDb.deals.requireById('deal-honeywell');
		const broker = mockDb.brokers.getById('julien');
		const brokerAgain = mockDb.brokers.getById('julien');
		const meetingDates = mockDb.meetings.listDateIsos();
		const meetingDatesAgain = mockDb.meetings.listDateIsos();
		const honeywellInsight = honeywell.insights?.[0];

		if (!honeywellInsight) {
			throw new Error('Expected Honeywell to include a nested opportunity insight.');
		}

		expect(deal).not.toBe(dealAgain);
		expect(broker).not.toBe(brokerAgain);
		expect(meetingDates).not.toBe(meetingDatesAgain);
		expect(honeywell.insights).not.toBe(mockDb.deals.requireById('deal-honeywell').insights);
		expect(Object.isFrozen(deal)).toBe(true);
		expect(deal.activityLevel).toBe('high');
		expect(deal.isReservedInEpic).toBe(true);
		expect('activityTrend' in deal).toBe(false);
		expect(Object.isFrozen(broker)).toBe(true);
		expect(Object.isFrozen(honeywellInsight)).toBe(true);
		expect('activityLevel' in honeywellInsight).toBe(false);
		expect(Object.isFrozen(meetingDates)).toBe(true);
		expect(() => {
			(deal as { dealName: string }).dealName = 'Mutated deal';
		}).toThrow();
		expect(() => {
			(broker as { name: string }).name = 'Mutated broker';
		}).toThrow();
		expect(() => {
			(deal as { activityLevel: string }).activityLevel = 'low';
		}).toThrow();
		expect(() => {
			(deal as { isReservedInEpic: boolean }).isReservedInEpic = false;
		}).toThrow();
		expect(() => {
			(honeywellInsight as { title: string }).title = 'Mutated insight';
		}).toThrow();
		expect(mockDb.deals.requireById('deal-3m').dealName).toBe('3M deal');
		expect(mockDb.deals.requireById('deal-3m').isReservedInEpic).toBe(true);
		expect(mockDb.deals.requireById('deal-honeywell').insights?.[0]?.title).toBe(
			'CFO was a customer at his last job'
		);
		expect(mockDb.brokers.getById('julien').name).toBe('Julien Newman');
		expect(mockDb.meetings.listDateIsos()).toContain('2026-01-12');
	});
});
