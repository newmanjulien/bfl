import { dealReaders } from './deals';
import { referenceReaders } from './reference';

export const mockDb = Object.freeze({
	...dealReaders,
	...referenceReaders
});

export type { BrokerId, BrokerRecord } from './reference';
