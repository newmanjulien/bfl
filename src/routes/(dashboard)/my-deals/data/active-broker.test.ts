// @vitest-environment edge-runtime

import { describe, expect, it } from 'vitest';
import type { BrokerKey } from '$lib/types/keys';
import { resolveMyDealsActiveBrokerKey } from './active-broker';

describe('resolveMyDealsActiveBrokerKey', () => {
	it('resolves the configured broker key from dashboard shell people', () => {
		const julienKey = 'julien' as BrokerKey;
		const people = [{ key: julienKey }, { key: 'mina' as BrokerKey }];

		expect(resolveMyDealsActiveBrokerKey(people, julienKey)).toBe(julienKey);
	});

	it('throws when the configured broker key is unavailable', () => {
		const julienKey = 'julien' as BrokerKey;
		const people = [{ key: 'mina' as BrokerKey }];

		expect(() => resolveMyDealsActiveBrokerKey(people, julienKey)).toThrow(
			'Unknown default broker key "julien".'
		);
	});
});
