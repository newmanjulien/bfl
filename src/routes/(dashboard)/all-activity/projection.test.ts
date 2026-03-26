import { describe, expect, it } from 'vitest';
import type { DetailRightRailData } from '$lib/dashboard/detail-rail-model';
import { getAllActivityDetailViewById, getAllActivityRowsForView } from './projection';

function getRightRailRow(rightRail: DetailRightRailData, rowId: string) {
	return (
		rightRail.sections
			.flatMap((section) => (section.kind === 'rows' ? section.rows : []))
			.find((row) => row.id === rowId) ?? null
	);
}

function getHelpfulContactsSection(rightRail: DetailRightRailData) {
	const section = rightRail.sections.find((candidate) => candidate.id === 'helpful-contacts');

	return section?.kind === 'helpful-contacts' ? section : null;
}

describe('all-activity projection', () => {
	it.each([
		['need-support', ['deal-tyson', 'deal-hilton', 'deal-fedex']],
		['duplicated-work', ['deal-3m']]
	] as const)('keeps the curated rows for %s', (view, expectedIds) => {
		const rows = getAllActivityRowsForView(view);

		expect(rows.map((row) => row.id)).toEqual(expectedIds);
	});

	it('keeps the current view in duplicated-work detail links', () => {
		const [row] = getAllActivityRowsForView('duplicated-work');

		expect(row?.navigation).toEqual({
			kind: 'detail',
			href: '/all-activity/duplicated-work/detail/deal-3m'
		});
	});

	it('uses special row behavior for unassigned and likely-out-of-date views', () => {
		const unassignedRows = getAllActivityRowsForView('unassigned');
		const staleRows = getAllActivityRowsForView('likely-out-of-date');

		expect(unassignedRows.length).toBeGreaterThan(0);
		expect(
			unassignedRows.every((row) => row.owner === null && row.lastActivity.kind === 'text')
		).toBe(true);

		expect(staleRows.map((row) => row.id)).toEqual(['deal-honeywell']);
		expect(staleRows.every((row) => row.navigation.kind === 'none')).toBe(true);
	});

	it('builds detail views with canonical deal numbers and helpful contacts', () => {
		const detail = getAllActivityDetailViewById('deal-3m');

		if (!detail) {
			throw new Error('Expected an all-activity detail view for deal-3m.');
		}

		const dealNumberRow = getRightRailRow(detail.rightRail, 'deal-number');
		const helpfulContacts = getHelpfulContactsSection(detail.rightRail);

		expect(detail.hero.dealNumber).toBe(74);
		expect(dealNumberRow?.kind).toBe('deal-number');

		if (dealNumberRow?.kind !== 'deal-number' || !helpfulContacts) {
			throw new Error('Expected deal-number and helpful-contacts sections.');
		}

		expect(dealNumberRow.dealNumber).toBe(74);
		expect(helpfulContacts.contacts.length).toBeGreaterThan(0);

		for (const contact of helpfulContacts.contacts) {
			expect(contact.title).toBeTruthy();
			expect(contact.company).toBeTruthy();
			expect(contact.linkedInUrl).toMatch(/^https:\/\/www\.linkedin\.com\/in\//);
		}
	});
});
