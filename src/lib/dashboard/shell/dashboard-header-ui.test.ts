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
		const filterHandler = vi.fn();
		const askForUpdateHandler = vi.fn();

		controller.setScope('my-deals', {
			buttons: [{ id: 'add-deal', label: 'Add deal', order: 10 }],
			handlers: {
				'add-deal': addDealHandler
			}
		});
		controller.setScope('all-activity', {
			buttons: [{ id: 'filter', label: 'Filter', order: 20 }],
			handlers: {
				filter: filterHandler
			}
		});
		controller.setScope('likely-out-of-date', {
			buttons: [{ id: 'ask-for-update', label: 'Ask for update', order: 30 }],
			handlers: {
				'ask-for-update': askForUpdateHandler
			}
		});

		const state = controller.getState();

		expect(state.buttons.map((button) => button.id)).toEqual([
			'add-deal',
			'filter',
			'ask-for-update'
		]);

		await state.handlers['add-deal']?.();
		await state.handlers.filter?.();
		await state.handlers['ask-for-update']?.();

		expect(addDealHandler).toHaveBeenCalledTimes(1);
		expect(filterHandler).toHaveBeenCalledTimes(1);
		expect(askForUpdateHandler).toHaveBeenCalledTimes(1);
	});

	it('preserves insertion order for buttons without an explicit order', () => {
		const controller = createDashboardHeaderUiController();

		controller.setScope('first', {
			buttons: [{ id: 'filter', label: 'Filter' }]
		});
		controller.setScope('second', {
			buttons: [{ id: 'ask-for-update', label: 'Ask for update' }]
		});

		expect(controller.getState().buttons.map((button) => button.id)).toEqual([
			'filter',
			'ask-for-update'
		]);
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
