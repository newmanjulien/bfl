import type { IsoDateString } from '$lib/domain/date-time';

export type OrgChartContactNode<ContactById extends string = string> = {
	id: string;
	name: string;
	role: string;
	lastContactedById: ContactById;
	lastContactedOnIso: IsoDateString;
	directReports?: OrgChartContactNode<ContactById>[];
};
