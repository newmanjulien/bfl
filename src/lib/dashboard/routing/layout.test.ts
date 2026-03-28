import { describe, expect, it } from 'vitest';
import type { DealKey, InsightKey, MeetingKey } from '$lib/types/keys';
import { resolveDashboardLayoutRoute } from './layout';

const dealKey = 'deal-doc-1' as DealKey;
const insightKey = 'insight-doc-1' as InsightKey;
const meetingKey = 'meeting-doc-1' as MeetingKey;

function createInput({
	pathname,
	routeId,
	params = {}
}: {
	pathname: string;
	routeId: string | null;
	params?: {
		view?: string;
		dealKey?: string;
		insightKey?: string;
	};
}) {
	return {
		routeId,
		params,
		url: new URL(pathname, 'http://localhost')
	};
}

describe('resolveDashboardLayoutRoute', () => {
	it('resolves every canonical dashboard route shape', () => {
		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: '/my-deals',
					routeId: '/(dashboard)/my-deals'
				})
			)
		).toEqual({
			route: {
				kind: 'my-deals-list',
				view: 'news'
			},
			redirectTo: null
		});

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: '/my-deals/deals',
					routeId: '/(dashboard)/my-deals/[view=myDealsView]',
					params: {
						view: 'deals'
					}
				})
			)
		).toEqual({
			route: {
				kind: 'my-deals-list',
				view: 'deals'
			},
			redirectTo: null
		});

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: `/my-deals/detail/${dealKey}`,
					routeId: '/(dashboard)/my-deals/detail/[dealKey]',
					params: {
						dealKey
					}
				})
			)
		).toEqual({
			route: {
				kind: 'my-deals-detail',
				dealKey,
				view: 'news',
				tab: 'news'
			},
			redirectTo: null
		});

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: `/my-deals/deals/detail/${dealKey}?tab=activity`,
					routeId: '/(dashboard)/my-deals/[view=myDealsView]/detail/[dealKey]',
					params: {
						view: 'deals',
						dealKey
					}
				})
			)
		).toEqual({
			route: {
				kind: 'my-deals-detail',
				dealKey,
				view: 'deals',
				tab: 'activity'
			},
			redirectTo: null
		});

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: '/all-activity',
					routeId: '/(dashboard)/all-activity'
				})
			)
		).toEqual({
			route: {
				kind: 'all-activity-list',
				view: 'deals'
			},
			redirectTo: null
		});

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: '/all-activity/need-support',
					routeId: '/(dashboard)/all-activity/[view=allActivityView]',
					params: {
						view: 'need-support'
					}
				})
			)
		).toEqual({
			route: {
				kind: 'all-activity-list',
				view: 'need-support'
			},
			redirectTo: null
		});

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: `/all-activity/detail/${dealKey}`,
					routeId: '/(dashboard)/all-activity/detail/[dealKey]',
					params: {
						dealKey
					}
				})
			)
		).toEqual({
			route: {
				kind: 'all-activity-detail',
				dealKey,
				view: 'deals'
			},
			redirectTo: null
		});

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: `/all-activity/need-support/detail/${dealKey}`,
					routeId: '/(dashboard)/all-activity/[view=allActivityView]/detail/[dealKey]',
					params: {
						view: 'need-support',
						dealKey
					}
				})
			)
		).toEqual({
			route: {
				kind: 'all-activity-detail',
				dealKey,
				view: 'need-support'
			},
			redirectTo: null
		});

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: '/opportunities',
					routeId: '/(dashboard)/opportunities'
				})
			)
		).toEqual({
			route: {
				kind: 'opportunities-list',
				meetingKey: null
			},
			redirectTo: null
		});

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: '/opportunities?meetingKey=meeting-doc-1',
					routeId: '/(dashboard)/opportunities'
				})
			)
		).toEqual({
			route: {
				kind: 'opportunities-list',
				meetingKey
			},
			redirectTo: null
		});

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: `/opportunities/detail/${insightKey}`,
					routeId: '/(dashboard)/opportunities/detail/[insightKey]',
					params: {
						insightKey
					}
				})
			)
		).toEqual({
			route: {
				kind: 'opportunities-detail',
				insightKey,
				meetingKey: null
			},
			redirectTo: null
		});

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: '/since-last-meeting',
					routeId: '/(dashboard)/since-last-meeting'
				})
			)
		).toEqual({
			route: {
				kind: 'since-last-meeting',
				meetingKey: null
			},
			redirectTo: null
		});
	});

	it('canonicalizes default my deals tabs for both default and non-default views', () => {
		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: `/my-deals/detail/${dealKey}?tab=news`,
					routeId: '/(dashboard)/my-deals/detail/[dealKey]',
					params: {
						dealKey
					}
				})
			)
		).toEqual({
			route: {
				kind: 'my-deals-detail',
				dealKey,
				view: 'news',
				tab: 'news'
			},
			redirectTo: `/my-deals/detail/${dealKey}`
		});

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: `/my-deals/deals/detail/${dealKey}?tab=news`,
					routeId: '/(dashboard)/my-deals/[view=myDealsView]/detail/[dealKey]',
					params: {
						view: 'deals',
						dealKey
					}
				})
			)
		).toEqual({
			route: {
				kind: 'my-deals-detail',
				dealKey,
				view: 'deals',
				tab: 'news'
			},
			redirectTo: `/my-deals/deals/detail/${dealKey}`
		});
	});

	it('rejects malformed route state and unexpected query params', () => {
		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: '/my-deals?foo=bar',
					routeId: '/(dashboard)/my-deals'
				})
			)
		).toBeNull();

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: '/my-deals/invalid',
					routeId: '/(dashboard)/my-deals/[view=myDealsView]',
					params: {
						view: 'invalid'
					}
				})
			)
		).toBeNull();

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: `/my-deals/detail/${dealKey}?tab=bogus`,
					routeId: '/(dashboard)/my-deals/detail/[dealKey]',
					params: {
						dealKey
					}
				})
			)
		).toBeNull();

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: `/my-deals/detail/${dealKey}?%2FupdateIndustry`,
					routeId: '/(dashboard)/my-deals/detail/[dealKey]',
					params: {
						dealKey
					}
				})
			)
		).toBeNull();

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: `/my-deals/detail/${dealKey}?tab=activity&foo=bar`,
					routeId: '/(dashboard)/my-deals/detail/[dealKey]',
					params: {
						dealKey
					}
				})
			)
		).toBeNull();

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: '/all-activity/invalid',
					routeId: '/(dashboard)/all-activity/[view=allActivityView]',
					params: {
						view: 'invalid'
					}
				})
			)
		).toBeNull();

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: `/all-activity/detail/${dealKey}?tab=activity`,
					routeId: '/(dashboard)/all-activity/detail/[dealKey]',
					params: {
						dealKey
					}
				})
			)
		).toBeNull();

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: '/opportunities?foo=bar',
					routeId: '/(dashboard)/opportunities'
				})
			)
		).toBeNull();

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: '/since-last-meeting?foo=bar',
					routeId: '/(dashboard)/since-last-meeting'
				})
			)
		).toBeNull();

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: '/opportunities',
					routeId: null
				})
			)
		).toBeNull();
	});
});
