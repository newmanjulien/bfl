import type { DashboardHeader } from '$lib/dashboard/shell/header/types';
import type { DashboardRouteRef } from '$lib/dashboard/routing';
import type { DashboardShellQueryResult } from './convex/validators';

// See https://svelte.dev/docs/kit/types#app.d.ts
	// for information about these interfaces
	declare global {
		namespace App {
			interface Error {
				message: string;
				code?: string;
			}
		// interface Locals {}
		interface PageData {
			header?: DashboardHeader;
			route?: DashboardRouteRef;
			dashboardShell?: DashboardShellQueryResult;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
