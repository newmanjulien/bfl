import { describe, expect, it } from 'vitest';
import { DEAL_INDUSTRIES } from '$lib/domain/deals';
import { mockDb } from '$lib/mock-db';

describe('mockDb selectors', () => {
	it('returns immutable snapshots instead of live canonical records', () => {
		const deal = mockDb.deals.requireById('deal-3m');
		const dealAgain = mockDb.deals.requireById('deal-3m');
		const honeywellInsight = mockDb.insights.requireById('insight-118');
		const broker = mockDb.brokers.requireById('julien');
		const brokerAgain = mockDb.brokers.requireById('julien');
		const meetingDates = mockDb.meetings.listDateIsos();
		const meetingDatesAgain = mockDb.meetings.listDateIsos();

		const originalDealName = deal.dealName;
		const originalReservedInEpic = deal.isReservedInEpic;
		const originalLikelyOutOfDate = deal.isLikelyOutOfDate;
		const originalInsightTitle = honeywellInsight.title;
		const originalBrokerName = broker.name;
		const originalMeetingDateIsos = [...meetingDates];

		expect(deal).not.toBe(dealAgain);
		expect(broker).not.toBe(brokerAgain);
		expect(meetingDates).not.toBe(meetingDatesAgain);
		expect(honeywellInsight).not.toBe(mockDb.insights.requireById('insight-118'));
		expect(Object.isFrozen(deal)).toBe(true);
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
			(deal as { isLikelyOutOfDate: boolean }).isLikelyOutOfDate = true;
		}).toThrow();
		expect(() => {
			(honeywellInsight as { title: string }).title = 'Mutated insight';
		}).toThrow();
		expect(mockDb.deals.requireById('deal-3m').dealName).toBe(originalDealName);
		expect(mockDb.deals.requireById('deal-3m').isReservedInEpic).toBe(originalReservedInEpic);
		expect(mockDb.deals.requireById('deal-3m').isLikelyOutOfDate).toBe(
			originalLikelyOutOfDate
		);
		expect(mockDb.insights.requireById('insight-118').title).toBe(originalInsightTitle);
		expect(mockDb.brokers.requireById('julien').name).toBe(originalBrokerName);
		expect(mockDb.meetings.listDateIsos()).toEqual(originalMeetingDateIsos);
	});

	it('exposes a valid industry on every deal snapshot', () => {
		for (const deal of mockDb.deals.list()) {
			expect(DEAL_INDUSTRIES.includes(deal.industry)).toBe(true);
		}
	});
});
