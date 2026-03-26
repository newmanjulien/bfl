import type { AllActivityTableRow } from './projection';

type LikelyOutOfDateRow = Pick<AllActivityTableRow, 'id'>;

export function getStaleLikelyOutOfDateSelectionRowIds(
	selectedRowIds: Iterable<string>,
	rows: readonly LikelyOutOfDateRow[]
) {
	const visibleRowIds = new Set(rows.map((row) => row.id));

	return [...selectedRowIds].filter((rowId) => !visibleRowIds.has(rowId));
}
