// @vitest-environment edge-runtime

import { describe, expect, it } from 'vitest';
import type { BrokerId } from '$lib/types/ids';
import { resolveMyDealsActiveBrokerId } from './active-broker';

describe('resolveMyDealsActiveBrokerId', () => {
	it('resolves the fixed broker from dashboard shell people', () => {
		const julienId = 'j57f8k0n9m2t3w4x5y6z7a8b9c0d1e2f' as BrokerId;
		const people = [
			{ id: julienId, legacyId: 'broker-julien' },
			{ id: 'a57f8k0n9m2t3w4x5y6z7a8b9c0d1e2f' as BrokerId, legacyId: 'broker-amy' }
		];

		expect(resolveMyDealsActiveBrokerId(people)).toBe(julienId);
	});

	it('throws when the fixed broker is unavailable', () => {
		const people = [{ id: 'a57f8k0n9m2t3w4x5y6z7a8b9c0d1e2f' as BrokerId, legacyId: 'broker-amy' }];

		expect(() => resolveMyDealsActiveBrokerId(people)).toThrow(
			'Missing default my-deals broker "broker-julien".'
		);
	});
});
