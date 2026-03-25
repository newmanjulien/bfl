import type { DealActivityRecord } from '$lib/domain/deals';
import type { OrgChartContactNode } from '$lib/domain/org-chart';
import type { PersonSummary } from '$lib/domain/people';
import { formatIsoDateLong } from '$lib/format/date-time';
import { mockDb, type BrokerId } from '$lib/mock-db';
import type {
	OrgChartNode,
	TimelineItem,
	TimelineMarker
} from '$lib/presentation/models';

export function resolveBrokerPerson(
	brokerId: BrokerId
): PersonSummary {
	return mockDb.brokers.requireById(brokerId);
}

export function resolveOptionalBrokerPerson(
	brokerId: BrokerId | null
): PersonSummary | null {
	return brokerId ? resolveBrokerPerson(brokerId) : null;
}

export function toTimelineItem(record: DealActivityRecord<BrokerId>): TimelineItem {
	const marker: TimelineMarker =
		record.marker.kind === 'broker-avatar'
			? {
					kind: 'avatar',
					person: resolveBrokerPerson(record.marker.brokerId)
				}
			: { kind: 'dot' };

	if (record.kind === 'actor-action') {
		return {
			kind: 'actor-action',
			id: record.id,
			actor: resolveBrokerPerson(record.actorBrokerId),
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

export function toOrgChartNode(record: OrgChartContactNode<BrokerId>): OrgChartNode {
	const broker = resolveBrokerPerson(record.lastContactedById);

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
					directReports: record.directReports.map((directReport) => toOrgChartNode(directReport))
				}
			: {})
	};
}
