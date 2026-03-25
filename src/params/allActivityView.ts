import type { ParamMatcher } from '@sveltejs/kit';
import { isNonDefaultAllActivityView } from '$lib/dashboard/all-activity-routes';

export const match = ((param: string) => isNonDefaultAllActivityView(param)) satisfies ParamMatcher;
