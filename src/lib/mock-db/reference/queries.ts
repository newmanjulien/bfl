import { createSnapshot } from '../snapshot';
import {
	brokerRecords,
	meetingDateIsos,
	type BrokerId,
	type BrokerRecord
} from './records';

const brokersById = new Map<BrokerId, BrokerRecord>(
	brokerRecords.map((record) => [record.id, record])
);

function hasBrokerId(brokerId: string): brokerId is BrokerId {
	return brokersById.has(brokerId);
}

function listBrokers() {
	return createSnapshot(brokerRecords);
}

function getBrokerById(brokerId: string): BrokerRecord | null {
	const broker = brokersById.get(brokerId);

	return broker ? createSnapshot(broker) : null;
}

function requireBrokerById(brokerId: string): BrokerRecord {
	if (!hasBrokerId(brokerId)) {
		throw new Error(`Unknown broker id "${brokerId}".`);
	}

	const broker = getBrokerById(brokerId);

	if (!broker) {
		throw new Error(`Unknown broker id "${brokerId}".`);
	}

	return broker;
}

function listMeetingDateIsos() {
	return createSnapshot(meetingDateIsos);
}

export const referenceReaders = Object.freeze({
	brokers: Object.freeze({
		list: listBrokers,
		getById: getBrokerById,
		requireById: requireBrokerById
	}),
	meetings: Object.freeze({
		listDateIsos: listMeetingDateIsos
	})
});
