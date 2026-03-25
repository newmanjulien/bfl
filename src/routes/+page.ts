import { redirect } from '@sveltejs/kit';
import { DEFAULT_DASHBOARD_ROUTE } from '$lib/dashboard/routes';

export const load = () => {
	redirect(307, DEFAULT_DASHBOARD_ROUTE);
};
