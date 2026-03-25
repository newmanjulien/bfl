import type { IsoDateString } from '$lib/domain/date-time';

export const brokersById = {
	julien: {
		id: 'julien',
		name: 'Julien Newman',
		avatar: '/avatars/aditya.jpg'
	},
	yash: {
		id: 'yash',
		name: 'Yash Patel',
		avatar: '/avatars/yash.webp'
	}
} as const;

export type BrokerId = keyof typeof brokersById;
export type BrokerRecord = (typeof brokersById)[BrokerId];

export const brokerRecords = [brokersById.julien, brokersById.yash] as const satisfies readonly BrokerRecord[];

export const meetingDateIsos = [
	'2025-12-01',
	'2025-12-15',
	'2025-12-29',
	'2026-01-12',
	'2026-01-26'
] as const satisfies readonly IsoDateString[];
