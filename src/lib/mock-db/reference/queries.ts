import { createSnapshot } from '../snapshot';
import {
	brokerRecords,
	brokersById,
	meetingDateIsos,
	type BrokerId,
	type BrokerRecord
} from './records';

function hasBrokerId(brokerId: string): brokerId is BrokerId {
	return brokerId in brokersById;
}

function listBrokers() {
	return createSnapshot(brokerRecords);
}

function getBrokerById(brokerId: BrokerId): BrokerRecord {
	return createSnapshot(brokersById[brokerId]);
}

function requireBrokerById(brokerId: string): BrokerRecord {
	if (!hasBrokerId(brokerId)) {
		throw new Error(`Unknown broker id "${brokerId}".`);
	}

	return getBrokerById(brokerId);
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
