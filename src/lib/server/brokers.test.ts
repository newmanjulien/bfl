// @vitest-environment edge-runtime

import { describe, expect, it } from 'vitest';
import type { BrokerId } from '$lib/types/ids';
import { resolveDefaultBroker } from './brokers';

type TestBroker = {
	id: BrokerId;
	name: string;
	avatar: string;
};

describe('resolveDefaultBroker', () => {
	it('returns the broker matching DEFAULT_BROKER_ID', () => {
		const defaultBrokerId = 'j57f8k0n9m2t3w4x5y6z7a8b9c0d1e2f' as BrokerId;
		const brokers: TestBroker[] = [
			{
				id: defaultBrokerId,
				name: 'Julien',
				avatar: '/avatars/julien.png'
			},
			{
				id: 'a57f8k0n9m2t3w4x5y6z7a8b9c0d1e2f' as BrokerId,
				name: 'Mina',
				avatar: '/avatars/mina.png'
			}
		];

		expect(resolveDefaultBroker(brokers, defaultBrokerId)).toEqual(brokers[0]);
	});

	it('falls back to the first broker when no default broker id is configured', () => {
		const brokers: TestBroker[] = [
			{
				id: 'j57f8k0n9m2t3w4x5y6z7a8b9c0d1e2f' as BrokerId,
				name: 'Julien',
				avatar: '/avatars/julien.png'
			},
			{
				id: 'a57f8k0n9m2t3w4x5y6z7a8b9c0d1e2f' as BrokerId,
				name: 'Mina',
				avatar: '/avatars/mina.png'
			}
		];

		expect(resolveDefaultBroker(brokers, null)).toEqual(brokers[0]);
	});

	it('falls back to the first broker when the configured broker is absent', () => {
		const brokers: TestBroker[] = [
			{
				id: 'a57f8k0n9m2t3w4x5y6z7a8b9c0d1e2f' as BrokerId,
				name: 'Mina',
				avatar: '/avatars/mina.png'
			}
		];

		expect(
			resolveDefaultBroker(brokers, 'j57f8k0n9m2t3w4x5y6z7a8b9c0d1e2f' as BrokerId)
		).toEqual(brokers[0]);
	});

	it('returns null when no brokers exist', () => {
		expect(resolveDefaultBroker([], 'j57f8k0n9m2t3w4x5y6z7a8b9c0d1e2f' as BrokerId)).toBeNull();
	});
});
