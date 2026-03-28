import { env } from '$env/dynamic/private';
import type { BrokerId } from '$lib/types/ids';

type BrokerEnv = Record<string, string | undefined>;

export const DEFAULT_BROKER_ID_ENV_VAR = 'DEFAULT_BROKER_ID';

export function resolveDefaultBrokerId(brokerEnv: BrokerEnv = env): BrokerId {
	const defaultBrokerId = brokerEnv.DEFAULT_BROKER_ID?.trim();

	if (!defaultBrokerId) {
		throw new Error(
			`Missing ${DEFAULT_BROKER_ID_ENV_VAR}. Set it to the Convex _id for the default broker.`
		);
	}

	return defaultBrokerId as BrokerId;
}
