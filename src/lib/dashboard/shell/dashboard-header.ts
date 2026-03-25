import { DASHBOARD_STATIC_ROUTES, type DashboardStaticHref } from '$lib/dashboard/routes';

export type DashboardHeaderControl =
	| {
			kind: 'meeting-date';
	  }
	| {
			kind: 'back-link';
			href: DashboardStaticHref;
			label: string;
	  };

export type DashboardHeaderAction = 'share' | 'broker-switch';
export type DashboardHeaderExtra = 'add-deal' | 'all-activity-filters';

export type DashboardHeader = {
	mode: 'context' | 'title';
	title: string;
	control?: DashboardHeaderControl;
	actions?: readonly DashboardHeaderAction[];
	extra?: DashboardHeaderExtra;
};

function normalizePathname(pathname: string) {
	if (!pathname) return '/';
	if (pathname !== '/' && pathname.endsWith('/')) return pathname.slice(0, -1);
	return pathname;
}

function matchesDetailPath(pathname: string, href: DashboardStaticHref) {
	return normalizePathname(pathname).startsWith(`${href}/detail/`);
}

function getHeroTitle(data: unknown) {
	if (!data || typeof data !== 'object' || !('hero' in data)) {
		return null;
	}

	const hero = data.hero;

	if (!hero || typeof hero !== 'object' || !('title' in hero)) {
		return null;
	}

	return typeof hero.title === 'string' ? hero.title : null;
}

export function getDashboardHeader(pathname: string, data?: unknown): DashboardHeader | null {
	const normalizedPathname = normalizePathname(pathname);

	if (normalizedPathname === DASHBOARD_STATIC_ROUTES['since-last-meeting']) {
		return {
			mode: 'context',
			title: 'Since last meeting',
			control: { kind: 'meeting-date' },
			actions: ['share', 'broker-switch']
		};
	}

	if (normalizedPathname === DASHBOARD_STATIC_ROUTES.forecast) {
		return {
			mode: 'context',
			title: 'Forecast',
			control: { kind: 'meeting-date' },
			actions: ['share', 'broker-switch']
		};
	}

	if (normalizedPathname === DASHBOARD_STATIC_ROUTES.opportunities) {
		return {
			mode: 'context',
			title: 'Opportunities & risks',
			control: { kind: 'meeting-date' },
			actions: ['share', 'broker-switch']
		};
	}

	if (normalizedPathname === DASHBOARD_STATIC_ROUTES['my-deals']) {
		return {
			mode: 'title',
			title: 'My deals',
			actions: ['share'],
			extra: 'add-deal'
		};
	}

	if (normalizedPathname === DASHBOARD_STATIC_ROUTES['all-activity']) {
		return {
			mode: 'title',
			title: 'All activity',
			actions: ['share'],
			extra: 'all-activity-filters'
		};
	}

	const heroTitle = getHeroTitle(data);

	if (matchesDetailPath(normalizedPathname, DASHBOARD_STATIC_ROUTES['all-activity'])) {
		return {
			mode: 'context',
			title: heroTitle ?? 'All activity',
			control: {
				kind: 'back-link',
				href: DASHBOARD_STATIC_ROUTES['all-activity'],
				label: 'All activity'
			},
			actions: ['share']
		};
	}

	if (matchesDetailPath(normalizedPathname, DASHBOARD_STATIC_ROUTES['my-deals'])) {
		return {
			mode: 'context',
			title: heroTitle ?? 'My deals',
			control: {
				kind: 'back-link',
				href: DASHBOARD_STATIC_ROUTES['my-deals'],
				label: 'My deals'
			},
			actions: ['share']
		};
	}

	if (matchesDetailPath(normalizedPathname, DASHBOARD_STATIC_ROUTES.opportunities)) {
		return {
			mode: 'context',
			title: heroTitle ?? 'Opportunities & risks',
			control: {
				kind: 'back-link',
				href: DASHBOARD_STATIC_ROUTES.opportunities,
				label: 'Opportunities & risks'
			},
			actions: ['share', 'broker-switch']
		};
	}

	return null;
}
