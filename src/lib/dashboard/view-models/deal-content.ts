import type { BrokerId } from '$lib/types/ids';
import type { IsoDate } from '$lib/types/dates';
import type { OrgChartNodeRecord } from '$lib/domain/org-chart';
import { formatIsoDateLong } from '$lib/format/date-time';

type PersonSummaryLike = {
	id: BrokerId;
	name: string;
	avatar: string;
};

type TimelineMarkerRecord<BrokerIdValue extends string = BrokerId> =
	| {
			kind: 'dot';
	  }
	| {
			kind: 'broker-avatar';
			brokerId: BrokerIdValue;
	  };

type DealActivityRecordLike<BrokerIdValue extends string = BrokerId> =
	| {
			kind: 'headline';
			id: string;
			dealId: string;
			stream: string;
			occurredOnIso: IsoDate;
			body: string;
			marker: TimelineMarkerRecord<BrokerIdValue>;
			title: string;
	  }
	| {
			kind: 'actor-action';
			id: string;
			dealId: string;
			stream: string;
			occurredOnIso: IsoDate;
			body: string;
			marker: TimelineMarkerRecord<BrokerIdValue>;
			actorBrokerId: BrokerIdValue;
			action: string;
	  };

export type TimelineMarker =
	| {
			kind: 'dot';
	  }
	| {
			kind: 'avatar';
			person: PersonSummaryLike;
	  };

type TimelineItemBase = {
	id: string;
	occurredOnIso: IsoDate;
	body: string;
	marker: TimelineMarker;
};

export type TimelineItem =
	| (TimelineItemBase & {
			kind: 'headline';
			title: string;
	  })
	| (TimelineItemBase & {
			kind: 'actor-action';
			actor: PersonSummaryLike;
			action: string;
	  });

export type OrgChartNode = {
	id: string;
	name: string;
	role: string;
	lastContacted: {
		by: string;
		on: string;
	};
	directReports?: OrgChartNode[];
};

export type PersonSummaryMap<TPerson extends PersonSummaryLike = PersonSummaryLike> = ReadonlyMap<
	TPerson['id'],
	TPerson
>;

export function createPersonSummaryMap<TPerson extends PersonSummaryLike>(
	people: readonly TPerson[]
): PersonSummaryMap<TPerson> {
	return new Map(people.map((person) => [person.id, person]));
}

export function resolveBrokerPerson<TPerson extends PersonSummaryLike>(
	peopleById: PersonSummaryMap<TPerson>,
	brokerId: TPerson['id']
): TPerson {
	const broker = peopleById.get(brokerId);

	if (!broker) {
		throw new Error(`Unknown broker id "${brokerId}".`);
	}

	return broker;
}

export function resolveOptionalBrokerPerson<TPerson extends PersonSummaryLike>(
	peopleById: PersonSummaryMap<TPerson>,
	brokerId: TPerson['id'] | null
): TPerson | null {
	return brokerId ? resolveBrokerPerson(peopleById, brokerId) : null;
}

export function toTimelineItem<
	BrokerIdValue extends BrokerId,
	TPerson extends PersonSummaryLike
>(
	record: DealActivityRecordLike<BrokerIdValue>,
	peopleById: PersonSummaryMap<TPerson>
): TimelineItem {
	const marker: TimelineMarker =
		record.marker.kind === 'broker-avatar'
			? {
					kind: 'avatar',
					person: resolveBrokerPerson(peopleById, record.marker.brokerId)
				}
			: { kind: 'dot' };

	if (record.kind === 'actor-action') {
		return {
			kind: 'actor-action',
			id: record.id,
			actor: resolveBrokerPerson(peopleById, record.actorBrokerId),
			action: record.action,
			occurredOnIso: record.occurredOnIso,
			body: record.body,
			marker
		};
	}

	return {
		kind: 'headline',
		id: record.id,
		title: record.title,
		occurredOnIso: record.occurredOnIso,
		body: record.body,
		marker
	};
}

export function toOrgChartRoot<
	BrokerIdValue extends BrokerId,
	TPerson extends PersonSummaryLike
>(
	nodes: readonly OrgChartNodeRecord<BrokerIdValue>[],
	peopleById: PersonSummaryMap<TPerson>
): OrgChartNode {
	const nodesById = new Map<string, OrgChartNodeRecord<BrokerIdValue>>();
	const nodesByParentId = new Map<string, OrgChartNodeRecord<BrokerIdValue>[]>();
	const rootIds: string[] = [];

	for (const node of nodes) {
		if (nodesById.has(node.id)) {
			throw new Error(`Duplicate org chart node id "${node.id}".`);
		}

		nodesById.set(node.id, node);

		if (!node.parentId) {
			rootIds.push(node.id);
			continue;
		}

		const existingNodes = nodesByParentId.get(node.parentId);

		if (existingNodes) {
			existingNodes.push(node);
			continue;
		}

		nodesByParentId.set(node.parentId, [node]);
	}

	if (rootIds.length === 0) {
		throw new Error('Missing root org chart node.');
	}

	if (rootIds.length > 1) {
		throw new Error(`Expected exactly one root org chart node, found ${rootIds.length}.`);
	}

	for (const node of nodes) {
		if (node.parentId && !nodesById.has(node.parentId)) {
			throw new Error(`Unknown parent org chart node "${node.parentId}" for "${node.id}".`);
		}
	}

	const builtNodes = new Map<string, OrgChartNode>();
	const buildingNodeIds = new Set<string>();

	function buildNode(nodeId: string): OrgChartNode {
		const existingNode = builtNodes.get(nodeId);

		if (existingNode) {
			return existingNode;
		}

		if (buildingNodeIds.has(nodeId)) {
			throw new Error(`Cycle detected in org chart at node "${nodeId}".`);
		}

		const node = nodesById.get(nodeId);

		if (!node) {
			throw new Error(`Unknown org chart node "${nodeId}".`);
		}

		buildingNodeIds.add(nodeId);

		const broker = resolveBrokerPerson(peopleById, node.lastContactedByBrokerId);
		const directReports = nodesByParentId
			.get(nodeId)
			?.map((childNode) => buildNode(childNode.id));

		const orgChartNode = {
			id: node.id,
			name: node.name,
			role: node.role,
			lastContacted: {
				by: broker.name,
				on: formatIsoDateLong(node.lastContactedOnIso)
			},
			...(directReports?.length ? { directReports } : {})
		};

		buildingNodeIds.delete(nodeId);
		builtNodes.set(nodeId, orgChartNode);

		return orgChartNode;
	}

	const root = buildNode(rootIds[0]);

	if (builtNodes.size !== nodes.length) {
		const unreachableNodeIds = nodes
			.filter((node) => !builtNodes.has(node.id))
			.map((node) => node.id);

		throw new Error(
			`Org chart nodes are not reachable from root "${rootIds[0]}": ${unreachableNodeIds.join(', ')}.`
		);
	}

	return root;
}
