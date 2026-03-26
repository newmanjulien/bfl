import { describe, expect, it } from 'vitest';
import type { DetailRightRailData } from '$lib/dashboard/detail-rail-model';
import { getOpportunityDetailViewById, opportunitiesTiles, opportunityRiskTiles } from './projection';

function getRightRailRow(rightRail: DetailRightRailData, rowId: string) {
	return (
		rightRail.sections
			.flatMap((section) => (section.kind === 'rows' ? section.rows : []))
			.find((row) => row.id === rowId) ?? null
	);
}

function getRowsSection(rightRail: DetailRightRailData, sectionId: string) {
	const section = rightRail.sections.find((candidate) => candidate.id === sectionId);

	return section?.kind === 'rows' ? section : null;
}

describe('opportunities projection', () => {
	it('uses parent deal numbers for tiles and detail views', () => {
		const opportunityTile = opportunitiesTiles.find((tile) => tile.id === 'insight-118');
		const riskTile = opportunityRiskTiles.find((tile) => tile.id === 'insight-119');
		const riskDetail = getOpportunityDetailViewById('insight-119');
		const riskDealNumberRow = riskDetail ? getRightRailRow(riskDetail.rightRail, 'deal-number') : null;

		expect(opportunityTile?.dealNumber).toBe(118);
		expect(riskTile?.dealNumber).toBe(74);
		expect(riskDetail?.hero.dealNumber).toBe(74);
		expect(riskDealNumberRow?.kind).toBe('deal-number');

		if (riskDealNumberRow?.kind !== 'deal-number') {
			throw new Error('Expected a deal-number row in the risk detail rail.');
		}

		expect(riskDealNumberRow.dealNumber).toBe(74);
	});

	it('limits opportunity detail rails to the overview section', () => {
		const detail = getOpportunityDetailViewById('insight-118');

		if (!detail) {
			throw new Error('Expected an opportunity detail view for insight-118.');
		}

		expect(detail.hero.dealNumber).toBe(118);
		expect(detail.rightRail.sections).toHaveLength(1);
		expect(getRowsSection(detail.rightRail, 'deal-overview')).not.toBeNull();
		expect(getRowsSection(detail.rightRail, 'deal-timing')).toBeNull();
		expect(getRightRailRow(detail.rightRail, 'claimed')).toBeNull();
		expect(getRightRailRow(detail.rightRail, 'last-activity')).toBeNull();
	});
});
