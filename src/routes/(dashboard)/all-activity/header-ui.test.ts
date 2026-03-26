import { describe, expect, it, vi } from 'vitest';
import { getAllActivityHeaderUiScope } from './header-ui';

describe('all-activity header ui', () => {
	it('exposes the filter button and handler', async () => {
		const filterHandler = vi.fn();
		const scope = getAllActivityHeaderUiScope(filterHandler);

		expect(scope.buttons?.map((button) => button.id)).toEqual(['filter']);

		await scope.handlers?.filter?.();

		expect(filterHandler).toHaveBeenCalledTimes(1);
	});
});
