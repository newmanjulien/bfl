import type { BrokerId } from '$lib/types/ids';

export const DEFAULT_MY_DEALS_ACTIVE_BROKER_LEGACY_ID = 'broker-julien' as const;

type BrokerOption = {
	id: BrokerId;
	legacyId: string;
};

export function resolveMyDealsActiveBrokerId(people: readonly BrokerOption[]): BrokerId {
	const activeBroker = people.find(
		(person) => person.legacyId === DEFAULT_MY_DEALS_ACTIVE_BROKER_LEGACY_ID
	);

	if (!activeBroker) {
		throw new Error(
			`Missing default my-deals broker "${DEFAULT_MY_DEALS_ACTIVE_BROKER_LEGACY_ID}".`
		);
	}

	return activeBroker.id;
}

export async function resolveMyDealsActiveBrokerIdFromParent(
	parent: () => Promise<{ dashboardShell: { people: readonly BrokerOption[] } }>
) {
	const { dashboardShell } = await parent();

	return resolveMyDealsActiveBrokerId(dashboardShell.people);
}
