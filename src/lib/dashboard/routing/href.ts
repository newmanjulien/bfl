import { resolve } from '$app/paths';
import type { PathnameWithSearchOrHash, ResolvedPathname } from '$app/types';
import { resolveDashboardRoute, type DashboardRouteRef } from './index';

const resolvePathname = resolve as (path: PathnameWithSearchOrHash) => ResolvedPathname;

export function resolveDashboardHref(route: DashboardRouteRef): ResolvedPathname {
	return resolvePathname(resolveDashboardRoute(route) as PathnameWithSearchOrHash);
}
