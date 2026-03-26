import type {
	DashboardHeaderButtonHandler,
	DashboardHeaderUiScope
} from '$lib/dashboard/shell/dashboard-header-ui';

export const ALL_ACTIVITY_HEADER_SCOPE_ID = 'all-activity-list';

export function getAllActivityHeaderUiScope(
	filterHandler: DashboardHeaderButtonHandler
): DashboardHeaderUiScope {
	return {
		buttons: [
			{
				id: 'filter',
				label: 'Filter',
				order: 20
			}
		],
		handlers: {
			filter: filterHandler
		}
	};
}
