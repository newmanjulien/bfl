import { getContext, hasContext, setContext } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

const DASHBOARD_HEADER_UI_CONTROLLER_KEY = Symbol('dashboard-header-ui-controller');

export type DashboardHeaderButtonHandler = () => void | Promise<void>;

export type DashboardHeaderButtonId = 'ask-for-update' | 'add-deal';

export type DashboardHeaderOverlayButton = {
	id: DashboardHeaderButtonId;
	label: string;
};

export type DashboardHeaderUiScope = {
	buttons?: readonly DashboardHeaderOverlayButton[];
	handlers?: Partial<Record<DashboardHeaderButtonId, DashboardHeaderButtonHandler>>;
};

export type DashboardHeaderUiResolvedState = {
	buttons: readonly DashboardHeaderOverlayButton[];
	handlers: Partial<Record<DashboardHeaderButtonId, DashboardHeaderButtonHandler>>;
};

export type DashboardHeaderUiController = {
	getState: () => DashboardHeaderUiResolvedState;
	setScope: (scopeId: string, scope: DashboardHeaderUiScope) => void;
	clearScope: (scopeId: string) => void;
	clearAll: () => void;
};

const FALLBACK_DASHBOARD_HEADER_UI_CONTROLLER: DashboardHeaderUiController = {
	getState: () => ({
		buttons: [],
		handlers: {}
	}),
	setScope: () => {},
	clearScope: () => {},
	clearAll: () => {}
};

function cloneScope(scope: DashboardHeaderUiScope): DashboardHeaderUiScope {
	return {
		buttons: scope.buttons ? [...scope.buttons] : undefined,
		handlers: scope.handlers ? { ...scope.handlers } : undefined
	};
}

export function resolveDashboardHeaderUiState(
	scopes: Iterable<DashboardHeaderUiScope>
): DashboardHeaderUiResolvedState {
	const buttonById = new Map<DashboardHeaderButtonId, DashboardHeaderOverlayButton>();
	const handlers: Partial<Record<DashboardHeaderButtonId, DashboardHeaderButtonHandler>> = {};

	for (const scope of scopes) {
		for (const button of scope.buttons ?? []) {
			buttonById.set(button.id, button);
		}

		Object.assign(handlers, scope.handlers);
	}

	return {
		buttons: [...buttonById.values()],
		handlers
	};
}

export function createDashboardHeaderUiController(): DashboardHeaderUiController {
	const scopes = new SvelteMap<string, DashboardHeaderUiScope>();

	return {
		getState() {
			return resolveDashboardHeaderUiState(scopes.values());
		},
		setScope(scopeId, scope) {
			scopes.set(scopeId, cloneScope(scope));
		},
		clearScope(scopeId) {
			scopes.delete(scopeId);
		},
		clearAll() {
			scopes.clear();
		}
	};
}

export function provideDashboardHeaderUiController(controller: DashboardHeaderUiController) {
	return setContext(DASHBOARD_HEADER_UI_CONTROLLER_KEY, controller);
}

export function useDashboardHeaderUiController() {
	if (!hasContext(DASHBOARD_HEADER_UI_CONTROLLER_KEY)) {
		return FALLBACK_DASHBOARD_HEADER_UI_CONTROLLER;
	}

	return getContext<DashboardHeaderUiController>(DASHBOARD_HEADER_UI_CONTROLLER_KEY);
}
