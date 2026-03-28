import type { BrokerId } from '$lib/types/ids';

type BrokerOption = {
	id: BrokerId;
};

export function resolveMyDealsActiveBrokerId(
	people: readonly BrokerOption[],
	defaultBrokerId: BrokerId
): BrokerId {
	const activeBroker = people.find((person) => person.id === defaultBrokerId);

	if (!activeBroker) {
		throw new Error(`Missing default my-deals broker "${defaultBrokerId}".`);
	}

	return activeBroker.id;
}

export async function resolveMyDealsActiveBrokerIdFromParent(
	parent: () => Promise<{ dashboardShell: { people: readonly BrokerOption[] } }>,
	defaultBrokerId: BrokerId
) {
	const { dashboardShell } = await parent();

	return resolveMyDealsActiveBrokerId(dashboardShell.people, defaultBrokerId);
}
