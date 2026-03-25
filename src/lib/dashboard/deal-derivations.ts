import type { DealNewsRecord } from '$lib/domain/deals';
import type { IsoDateString } from '$lib/domain/date-time';

type ActivityRecordLike = {
	occurredOnIso: IsoDateString;
	id: string;
};

type NewsRecordLike = Pick<DealNewsRecord, 'id' | 'publishedOnIso'>;

export function sortDealActivitiesAscending<T extends ActivityRecordLike>(records: readonly T[]) {
	return [...records].sort((left, right) => {
		const dateComparison = left.occurredOnIso.localeCompare(right.occurredOnIso);

		if (dateComparison !== 0) {
			return dateComparison;
		}

		return left.id.localeCompare(right.id);
	});
}

export function sortDealNewsDescending<T extends NewsRecordLike>(records: readonly T[]) {
	return [...records].sort((left, right) => {
		const dateComparison = right.publishedOnIso.localeCompare(left.publishedOnIso);

		if (dateComparison !== 0) {
			return dateComparison;
		}

		return left.id.localeCompare(right.id);
	});
}

export function getLatestDealActivity<T extends ActivityRecordLike>(records: readonly T[]) {
	const sortedRecords = sortDealActivitiesAscending(records);

	return sortedRecords[sortedRecords.length - 1] ?? null;
}

export function getLatestDealNews<T extends NewsRecordLike>(records: readonly T[]) {
	return sortDealNewsDescending(records)[0] ?? null;
}
