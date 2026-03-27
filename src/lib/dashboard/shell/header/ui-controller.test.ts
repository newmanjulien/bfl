import { describe, expect, it, vi } from 'vitest';
import { createDashboardHeaderUiController } from './ui-controller';

describe('dashboard header ui controller', () => {
	it('merges header ui controller scopes and clears them', async () => {
		const controller = createDashboardHeaderUiController();
		const addDealHandler = vi.fn();
		const filterHandler = vi.fn();
		const askForUpdateHandler = vi.fn();

		expect(controller.getState()).toEqual({
			buttons: [],
			handlers: {}
		});

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

		const mergedState = controller.getState();

		expect(mergedState.buttons.map((button) => button.id)).toEqual([
			'add-deal',
			'filter',
			'ask-for-update'
		]);

		await mergedState.handlers['add-deal']?.();
		await mergedState.handlers.filter?.();
		await mergedState.handlers['ask-for-update']?.();

		expect(addDealHandler).toHaveBeenCalledTimes(1);
		expect(filterHandler).toHaveBeenCalledTimes(1);
		expect(askForUpdateHandler).toHaveBeenCalledTimes(1);

		controller.clearScope('likely-out-of-date');
		expect(controller.getState().buttons.map((button) => button.id)).toEqual([
			'add-deal',
			'filter'
		]);

		controller.clearAll();
		expect(controller.getState()).toEqual({
			buttons: [],
			handlers: {}
		});
	});

	it('preserves insertion order for unordered buttons', () => {
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
});
