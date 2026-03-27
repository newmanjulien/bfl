import { api, createServerConvexClient } from '$lib/server/convex';

export const load = async () => ({
	dashboardShell: await createServerConvexClient().query(api.shell.getDashboardShell)
});
