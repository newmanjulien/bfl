import { describe, expect, it, vi } from 'vitest';
import {
	createDashboardHeaderUiController
} from './dashboard-header-ui';

describe('dashboard header ui controller', () => {
	it('defaults to no overlay buttons or handlers', () => {
		const controller = createDashboardHeaderUiController();

		expect(controller.getState()).toEqual({
			buttons: [],
			handlers: {}
		});
	});

	it('merges buttons and handlers across scopes', async () => {
		const controller = createDashboardHeaderUiController();
		const addDealHandler = vi.fn();
		const askForUpdateHandler = vi.fn();

		controller.setScope('my-deals', {
			handlers: {
				'add-deal': addDealHandler
			}
		});
		controller.setScope('likely-out-of-date', {
			buttons: [{ id: 'ask-for-update', label: 'Ask for update' }],
			handlers: {
				'ask-for-update': askForUpdateHandler
			}
		});

		const state = controller.getState();

		expect(state.buttons.map((button) => button.id)).toEqual(['ask-for-update']);

		await state.handlers['add-deal']?.();
		await state.handlers['ask-for-update']?.();

		expect(addDealHandler).toHaveBeenCalledTimes(1);
		expect(askForUpdateHandler).toHaveBeenCalledTimes(1);
	});

	it('clears individual scopes and all scopes', () => {
		const controller = createDashboardHeaderUiController();

		controller.setScope('likely-out-of-date', {
			buttons: [{ id: 'ask-for-update', label: 'Ask for update' }]
		});
		controller.setScope('my-deals', {
			handlers: {
				'add-deal': () => {}
			}
		});
		controller.clearScope('likely-out-of-date');

		expect(controller.getState()).toEqual({
			buttons: [],
			handlers: {
				'add-deal': expect.any(Function)
			}
		});

		controller.clearAll();

		expect(controller.getState()).toEqual({
			buttons: [],
			handlers: {}
		});
	});
});
