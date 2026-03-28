import { env } from '$env/dynamic/private';
import type { BrokerId } from '$lib/types/ids';

type BrokerEnv = Record<string, string | undefined>;
type BrokerWithId = {
	id: BrokerId;
};

export const DEFAULT_BROKER_ID_ENV_VAR = 'DEFAULT_BROKER_ID';

export function resolveDefaultBrokerId(brokerEnv: BrokerEnv = env): BrokerId | null {
	const defaultBrokerId = brokerEnv.DEFAULT_BROKER_ID?.trim();

	if (!defaultBrokerId) {
		return null;
	}

	return defaultBrokerId as BrokerId;
}

export function resolveDefaultBroker<TBroker extends BrokerWithId>(
	brokers: readonly TBroker[],
	defaultBrokerId: BrokerId | null
): TBroker | null {
	const defaultBroker = defaultBrokerId
		? brokers.find((broker) => broker.id === defaultBrokerId)
		: null;

	if (defaultBroker) {
		return defaultBroker;
	}

	return brokers[0] ?? null;
}
