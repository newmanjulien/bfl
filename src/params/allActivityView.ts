import type { ParamMatcher } from '@sveltejs/kit';
import { isNonDefaultAllActivityView } from '$lib/dashboard/routing/all-activity';

export const match = ((param: string) => isNonDefaultAllActivityView(param)) satisfies ParamMatcher;
