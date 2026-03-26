import type { DealActivityRecord } from '$lib/domain/deals';
import type { OrgChartContactNode } from '$lib/domain/org-chart';
import type { PersonSummary } from '$lib/domain/people';
import { formatIsoDateLong } from '$lib/format/date-time';
import type {
	OrgChartNode,
	TimelineItem,
	TimelineMarker
} from '$lib/presentation/models';

export type PersonSummaryMap = ReadonlyMap<PersonSummary['id'], PersonSummary>;

export function createPersonSummaryMap(
	people: readonly PersonSummary[]
): PersonSummaryMap {
	return new Map(people.map((person) => [person.id, person]));
}

export function resolveBrokerPerson(
	peopleById: PersonSummaryMap,
	brokerId: string
): PersonSummary {
	const broker = peopleById.get(brokerId);

	if (!broker) {
		throw new Error(`Unknown broker id "${brokerId}".`);
	}

	return broker;
}

export function resolveOptionalBrokerPerson(
	peopleById: PersonSummaryMap,
	brokerId: string | null
): PersonSummary | null {
	return brokerId ? resolveBrokerPerson(peopleById, brokerId) : null;
}

export function toTimelineItem<BrokerId extends string>(
	record: DealActivityRecord<BrokerId>,
	peopleById: PersonSummaryMap
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

export function toOrgChartNode<ContactById extends string>(
	record: OrgChartContactNode<ContactById>,
	peopleById: PersonSummaryMap
): OrgChartNode {
	const broker = resolveBrokerPerson(peopleById, record.lastContactedById);

	return {
		id: record.id,
		name: record.name,
		role: record.role,
		lastContacted: {
			by: broker.name,
			on: formatIsoDateLong(record.lastContactedOnIso)
		},
		...(record.directReports
			? {
					directReports: record.directReports.map((directReport) =>
						toOrgChartNode(directReport, peopleById)
					)
				}
			: {})
	};
}
