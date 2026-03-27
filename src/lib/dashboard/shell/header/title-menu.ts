import type {
	DashboardHeaderTitleMenu,
	DashboardHeaderTitleMenuRouteRef
} from './types';

type HeaderMenuOption<TId extends string> = {
	id: TId;
	label: string;
};

type BuildHeaderTitleMenuParams<TId extends string> = {
	menuId: string;
	ariaLabel: string;
	sectionLabel: string;
	activeLabel: string;
	selectedId: TId;
	options: readonly HeaderMenuOption<TId>[];
	buildRoute: (id: TId) => DashboardHeaderTitleMenuRouteRef;
};

export function buildHeaderTitleMenu<TId extends string>({
	menuId,
	ariaLabel,
	sectionLabel,
	activeLabel,
	selectedId,
	options,
	buildRoute
}: BuildHeaderTitleMenuParams<TId>): DashboardHeaderTitleMenu {
	return {
		kind: 'link-menu',
		menuId,
		ariaLabel,
		sectionLabel,
		activeLabel,
		options: options.map((option) => ({
			id: option.id,
			label: option.label,
			route: buildRoute(option.id),
			current: option.id === selectedId
		}))
	};
}
