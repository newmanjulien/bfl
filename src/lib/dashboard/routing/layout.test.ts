import { describe, expect, it } from 'vitest';
import { resolveDashboardLayoutRoute } from './layout';

const dealId = 'deal-doc-1';
const insightId = 'insight-doc-1';

function createInput({
	pathname,
	routeId,
	params = {}
}: {
	pathname: string;
	routeId: string | null;
	params?: {
		view?: string;
		detailId?: string;
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
					pathname: `/my-deals/detail/${dealId}`,
					routeId: '/(dashboard)/my-deals/detail/[detailId]',
					params: {
						detailId: dealId
					}
				})
			)
		).toEqual({
			route: {
				kind: 'my-deals-detail',
				dealId,
				view: 'news',
				tab: 'news'
			},
			redirectTo: null
		});

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: `/my-deals/deals/detail/${dealId}?tab=activity`,
					routeId: '/(dashboard)/my-deals/[view=myDealsView]/detail/[detailId]',
					params: {
						view: 'deals',
						detailId: dealId
					}
				})
			)
		).toEqual({
			route: {
				kind: 'my-deals-detail',
				dealId,
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
					pathname: `/all-activity/detail/${dealId}`,
					routeId: '/(dashboard)/all-activity/detail/[detailId]',
					params: {
						detailId: dealId
					}
				})
			)
		).toEqual({
			route: {
				kind: 'all-activity-detail',
				dealId,
				view: 'deals'
			},
			redirectTo: null
		});

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: `/all-activity/need-support/detail/${dealId}`,
					routeId: '/(dashboard)/all-activity/[view=allActivityView]/detail/[detailId]',
					params: {
						view: 'need-support',
						detailId: dealId
					}
				})
			)
		).toEqual({
			route: {
				kind: 'all-activity-detail',
				dealId,
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
				meetingId: null
			},
			redirectTo: null
		});

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: '/opportunities?meetingId=meeting-doc-1',
					routeId: '/(dashboard)/opportunities'
				})
			)
		).toEqual({
			route: {
				kind: 'opportunities-list',
				meetingId: 'meeting-doc-1'
			},
			redirectTo: null
		});

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: `/opportunities/detail/${insightId}`,
					routeId: '/(dashboard)/opportunities/detail/[detailId]',
					params: {
						detailId: insightId
					}
				})
			)
		).toEqual({
			route: {
				kind: 'opportunities-detail',
				insightId,
				meetingId: null
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
				meetingId: null
			},
			redirectTo: null
		});
	});

	it('canonicalizes default my deals tabs for both default and non-default views', () => {
		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: `/my-deals/detail/${dealId}?tab=news`,
					routeId: '/(dashboard)/my-deals/detail/[detailId]',
					params: {
						detailId: dealId
					}
				})
			)
		).toEqual({
			route: {
				kind: 'my-deals-detail',
				dealId,
				view: 'news',
				tab: 'news'
			},
			redirectTo: `/my-deals/detail/${dealId}`
		});

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: `/my-deals/deals/detail/${dealId}?tab=news`,
					routeId: '/(dashboard)/my-deals/[view=myDealsView]/detail/[detailId]',
					params: {
						view: 'deals',
						detailId: dealId
					}
				})
			)
		).toEqual({
			route: {
				kind: 'my-deals-detail',
				dealId,
				view: 'deals',
				tab: 'news'
			},
			redirectTo: `/my-deals/deals/detail/${dealId}`
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
					pathname: `/my-deals/detail/${dealId}?tab=bogus`,
					routeId: '/(dashboard)/my-deals/detail/[detailId]',
					params: {
						detailId: dealId
					}
				})
			)
		).toBeNull();

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: `/my-deals/detail/${dealId}?%2FupdateIndustry`,
					routeId: '/(dashboard)/my-deals/detail/[detailId]',
					params: {
						detailId: dealId
					}
				})
			)
		).toBeNull();

		expect(
			resolveDashboardLayoutRoute(
				createInput({
					pathname: `/my-deals/detail/${dealId}?tab=activity&foo=bar`,
					routeId: '/(dashboard)/my-deals/detail/[detailId]',
					params: {
						detailId: dealId
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
					pathname: `/all-activity/detail/${dealId}?tab=activity`,
					routeId: '/(dashboard)/all-activity/detail/[detailId]',
					params: {
						detailId: dealId
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
