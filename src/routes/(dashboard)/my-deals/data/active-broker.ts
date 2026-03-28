import type { BrokerId } from '$lib/types/ids';

type BrokerOption = {
	id: BrokerId;
};

export function resolveMyDealsActiveBrokerId(
	people: readonly BrokerOption[],
	defaultBrokerId: BrokerId | null
): BrokerId {
	const activeBroker = defaultBrokerId
		? people.find((person) => person.id === defaultBrokerId)
		: null;

	if (activeBroker) {
		return activeBroker.id;
	}

	const fallbackBroker = people[0];

	if (!fallbackBroker) {
		throw new Error('No brokers available for my deals.');
	}

	return fallbackBroker.id;
}

export async function resolveMyDealsActiveBrokerIdFromParent(
	parent: () => Promise<{ dashboardShell: { people: readonly BrokerOption[] } }>,
	defaultBrokerId: BrokerId
) {
	const { dashboardShell } = await parent();

	return resolveMyDealsActiveBrokerId(dashboardShell.people, defaultBrokerId);
}
