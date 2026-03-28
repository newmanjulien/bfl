import type { DashboardHeaderUiScope } from '$lib/dashboard/shell/header/ui-controller';
import type { AllActivityListPageData } from '$lib/dashboard/page-models/allActivity';

export const LIKELY_OUT_OF_DATE_HEADER_SCOPE_ID = 'all-activity-likely-out-of-date';

type AllActivityTableRow = AllActivityListPageData['rows'][number];
type LikelyOutOfDateRow = Pick<AllActivityTableRow, 'key'>;

export function getLikelyOutOfDateHeaderUiScope(
	selectedRowCount: number
): DashboardHeaderUiScope | null {
	if (selectedRowCount < 1) {
		return null;
	}

	return {
		buttons: [
			{
				id: 'ask-for-update',
				label: 'Ask for update',
				order: 30
			}
		]
	};
}

export function getStaleLikelyOutOfDateSelectionRowKeys(
	selectedRowKeys: Iterable<LikelyOutOfDateRow['key']>,
	rows: readonly LikelyOutOfDateRow[]
) {
	const visibleRowKeys = new Set(rows.map((row) => row.key));

	return [...selectedRowKeys].filter((rowKey) => !visibleRowKeys.has(rowKey));
}
