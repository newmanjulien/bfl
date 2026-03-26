import type { DashboardHeaderUiScope } from '$lib/dashboard/shell/dashboard-header-ui';

export const LIKELY_OUT_OF_DATE_HEADER_SCOPE_ID = 'all-activity-likely-out-of-date';

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
