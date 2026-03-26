import type { IsoDateString } from '$lib/domain/date-time';

export type BrokerId = string;

export type BrokerRecord = {
	id: BrokerId;
	name: string;
	avatar: string;
};

export const brokerRecords = [
	{
		id: 'julien',
		name: 'Julien Newman',
		avatar: '/avatars/aditya.jpg'
	},
	{
		id: 'yash',
		name: 'Yash Patel',
		avatar: '/avatars/yash.webp'
	}
] as const satisfies readonly BrokerRecord[];

export const meetingDateIsos = [
	'2025-12-01',
	'2025-12-15',
	'2025-12-29',
	'2026-01-12',
	'2026-01-26'
] as const satisfies readonly IsoDateString[];
