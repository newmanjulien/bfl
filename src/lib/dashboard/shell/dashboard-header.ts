import {
	isAllActivityDetailPath,
	isAllActivityListPath,
	type AllActivityListHref
} from '$lib/dashboard/all-activity-routes';
import { DASHBOARD_STATIC_ROUTES, type DashboardStaticHref } from '$lib/dashboard/routes';

type DashboardHeaderHref = DashboardStaticHref | AllActivityListHref;

export type DashboardHeaderControl =
	| {
			kind: 'meeting-date';
	  }
	| {
			kind: 'back-link';
			href: DashboardHeaderHref;
			label: string;
	  };

export type DashboardHeaderAction = 'share' | 'broker-switch';
export type DashboardHeaderFilter = 'broker' | 'activity-level';
export type DashboardHeaderExtra =
	| {
			kind: 'add-deal';
	  }
	| {
			kind: 'filters';
			filters: readonly DashboardHeaderFilter[];
	  };

export type DashboardHeaderTitleMenuOption = {
	id: string;
	label: string;
	href: DashboardHeaderHref;
	current: boolean;
};

export type DashboardHeaderTitleMenu = {
	kind: 'link-menu';
	menuId: string;
	ariaLabel: string;
	sectionLabel: string;
	activeLabel: string;
	options: readonly DashboardHeaderTitleMenuOption[];
};

export type DashboardHeaderLeading =
	| {
			kind: 'title';
			title: string;
	  }
	| {
			kind: 'title-menu';
			title: string;
			menu: DashboardHeaderTitleMenu;
	  }
	| {
			kind: 'control-title';
			control: DashboardHeaderControl;
			title: string;
	  };

export type DashboardHeader = {
	leading: DashboardHeaderLeading;
	actions?: readonly DashboardHeaderAction[];
	extra?: DashboardHeaderExtra;
};

function normalizePathname(pathname: string) {
	if (!pathname) return '/';
	if (pathname !== '/' && pathname.endsWith('/')) return pathname.slice(0, -1);
	return pathname;
}

function matchesDetailPath(pathname: string, href: DashboardStaticHref) {
	const normalizedPathname = normalizePathname(pathname);

	return normalizedPathname.startsWith(`${href}/detail/`);
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

function isDashboardHeaderTitleMenuOption(
	value: unknown
): value is DashboardHeaderTitleMenuOption {
	if (!value || typeof value !== 'object') {
		return false;
	}

	return (
		'id' in value &&
		typeof value.id === 'string' &&
		'label' in value &&
		typeof value.label === 'string' &&
		'href' in value &&
		typeof value.href === 'string' &&
		'current' in value &&
		typeof value.current === 'boolean'
	);
}

function getHeaderTitleMenu(data: unknown): DashboardHeaderTitleMenu | null {
	if (!data || typeof data !== 'object' || !('headerTitleMenu' in data)) {
		return null;
	}

	const titleMenu = data.headerTitleMenu;

	if (!titleMenu || typeof titleMenu !== 'object') {
		return null;
	}

	if (
		!('kind' in titleMenu) ||
		titleMenu.kind !== 'link-menu' ||
		!('menuId' in titleMenu) ||
		typeof titleMenu.menuId !== 'string' ||
		!('ariaLabel' in titleMenu) ||
		typeof titleMenu.ariaLabel !== 'string' ||
		!('sectionLabel' in titleMenu) ||
		typeof titleMenu.sectionLabel !== 'string' ||
		!('activeLabel' in titleMenu) ||
		typeof titleMenu.activeLabel !== 'string' ||
		!('options' in titleMenu) ||
		!Array.isArray(titleMenu.options) ||
		!titleMenu.options.every(isDashboardHeaderTitleMenuOption)
	) {
		return null;
	}

	return {
		kind: 'link-menu',
		menuId: titleMenu.menuId,
		ariaLabel: titleMenu.ariaLabel,
		sectionLabel: titleMenu.sectionLabel,
		activeLabel: titleMenu.activeLabel,
		options: titleMenu.options
	};
}

function getHeaderBackHref(data: unknown) {
	if (!data || typeof data !== 'object' || !('headerBackHref' in data)) {
		return null;
	}

	return typeof data.headerBackHref === 'string'
		? (data.headerBackHref as DashboardHeaderHref)
		: null;
}

export function getDashboardHeader(pathname: string, data?: unknown): DashboardHeader | null {
	const normalizedPathname = normalizePathname(pathname);

	if (normalizedPathname === DASHBOARD_STATIC_ROUTES['since-last-meeting']) {
		return {
			leading: {
				kind: 'control-title',
				title: 'Since last meeting',
				control: { kind: 'meeting-date' }
			},
			actions: ['share', 'broker-switch']
		};
	}

	if (normalizedPathname === DASHBOARD_STATIC_ROUTES.opportunities) {
		return {
			leading: {
				kind: 'control-title',
				title: 'Opportunities & risks',
				control: { kind: 'meeting-date' }
			},
			actions: ['share', 'broker-switch']
		};
	}

	if (normalizedPathname === DASHBOARD_STATIC_ROUTES['my-deals']) {
		return {
			leading: { kind: 'title', title: 'My deals' },
			actions: ['share'],
			extra: { kind: 'add-deal' }
		};
	}

	if (isAllActivityListPath(normalizedPathname)) {
		const titleMenu = getHeaderTitleMenu(data);

		return {
			leading: titleMenu
				? { kind: 'title-menu', title: 'All activity', menu: titleMenu }
				: { kind: 'title', title: 'All activity' },
			actions: ['share'],
			extra: {
				kind: 'filters',
				filters: ['broker', 'activity-level']
			}
		};
	}

	const heroTitle = getHeroTitle(data);

	if (isAllActivityDetailPath(normalizedPathname)) {
		const headerBackHref = getHeaderBackHref(data) ?? DASHBOARD_STATIC_ROUTES['all-activity'];

		return {
			leading: {
				kind: 'control-title',
				title: heroTitle ?? 'All activity',
				control: {
					kind: 'back-link',
					href: headerBackHref,
					label: 'All activity'
				}
			},
			actions: ['share']
		};
	}

	if (matchesDetailPath(normalizedPathname, DASHBOARD_STATIC_ROUTES['my-deals'])) {
		return {
			leading: {
				kind: 'control-title',
				title: heroTitle ?? 'My deals',
				control: {
					kind: 'back-link',
					href: DASHBOARD_STATIC_ROUTES['my-deals'],
					label: 'My deals'
				}
			},
			actions: ['share']
		};
	}

	if (matchesDetailPath(normalizedPathname, DASHBOARD_STATIC_ROUTES.opportunities)) {
		return {
			leading: {
				kind: 'control-title',
				title: heroTitle ?? 'Opportunities & risks',
				control: {
					kind: 'back-link',
					href: DASHBOARD_STATIC_ROUTES.opportunities,
					label: 'Opportunities & risks'
				}
			},
			actions: ['share', 'broker-switch']
		};
	}

	return null;
}
