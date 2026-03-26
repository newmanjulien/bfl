import type { DashboardHeaderUiScope } from '$lib/dashboard/shell/dashboard-header-ui';
import type { MyDealsView } from '$lib/dashboard/my-deals-routes';

export const MY_DEALS_HEADER_SCOPE_ID = 'my-deals-list';

export function getMyDealsHeaderUiScope(selectedView: MyDealsView): DashboardHeaderUiScope | null {
	if (selectedView !== 'deals') {
		return null;
	}

	return {
		buttons: [
			{
				id: 'add-deal',
				label: 'Add deal',
				order: 10
			}
		]
	};
}
