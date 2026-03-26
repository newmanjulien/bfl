import type {
	DealContextRecord,
	DealHelpfulContactRecord,
	DealSnapshotRecord
} from '$lib/domain/deals';
import type { PersonSummary } from '$lib/domain/people';
import {
	formatIsoDateTimeRelative,
	formatIsoDateTimeRelativeMonths
} from '$lib/format/date-time';
import type {
	DetailRightRailData,
	DetailRightRailHelpfulContact,
	DetailRightRailSection
} from './detail-rail-model';

function isDetailRightRailSection(
	section: DetailRightRailSection | null | undefined | false
): section is DetailRightRailSection {
	return Boolean(section);
}

function toDetailRightRailHelpfulContacts(
	helpfulContacts: readonly DealHelpfulContactRecord[]
): readonly DetailRightRailHelpfulContact[] {
	return helpfulContacts.map<DetailRightRailHelpfulContact>((contact) => ({
		id: contact.id,
		name: contact.name,
		title: contact.title,
		company: contact.company,
		linkedInUrl: contact.linkedInUrl
	}));
}

export function toDetailRightRailData(
	sections: readonly (DetailRightRailSection | null | undefined | false)[]
): DetailRightRailData {
	return {
		sections: sections.filter(isDetailRightRailSection)
	};
}

export function toDetailRightRailOverviewSection(
	deal: DealSnapshotRecord,
	owner: PersonSummary | null
): DetailRightRailSection {
	return {
		id: 'deal-overview',
		kind: 'rows',
		rows: [
			{
				id: 'deal',
				label: 'Deal',
				kind: 'text',
				value: deal.dealName
			},
			{
				id: 'deal-number',
				label: 'ID',
				kind: 'deal-number',
				dealNumber: deal.dealNumber
			},
			{
				id: 'activity-level',
				label: 'Activity',
				kind: 'activity-level',
				activityLevel: deal.activityLevel
			},
			{
				id: 'industry',
				label: 'Industry',
				kind: 'text',
				value: deal.industry
			},
			{
				id: 'owner',
				label: 'Owner',
				kind: 'person',
				person: owner,
				emptyValue: 'Unassigned'
			},
			{
				id: 'stage',
				label: 'Stage',
				kind: 'text',
				value: deal.stage
			}
		]
	};
}

export function toDetailRightRailTimingSection(
	deal: DealSnapshotRecord,
	detailContext: DealContextRecord
): DetailRightRailSection {
	return {
		id: 'deal-timing',
		kind: 'rows',
		rows: [
			{
				id: 'claimed',
				label: 'Claimed',
				kind: 'text',
				value: formatIsoDateTimeRelativeMonths(detailContext.claimedAtIso)
			},
			{
				id: 'last-activity',
				label: 'Last activity',
				kind: 'text',
				value: deal.lastActivityAtIso
					? formatIsoDateTimeRelative(deal.lastActivityAtIso)
					: formatIsoDateTimeRelativeMonths(detailContext.claimedAtIso)
			}
		]
	};
}

export function toDetailRightRailHelpfulContactsSection(
	detailContext: DealContextRecord
): DetailRightRailSection | null {
	if (!detailContext.helpfulContacts?.length) {
		return null;
	}

	return {
		id: 'helpful-contacts',
		kind: 'helpful-contacts',
		title: 'Contacts who can help',
		contacts: toDetailRightRailHelpfulContacts(detailContext.helpfulContacts)
	};
}
