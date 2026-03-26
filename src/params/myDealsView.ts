import type { ParamMatcher } from '@sveltejs/kit';
import { isNonDefaultMyDealsView } from '$lib/dashboard/my-deals-routes';

export const match = ((param: string) => isNonDefaultMyDealsView(param)) satisfies ParamMatcher;
