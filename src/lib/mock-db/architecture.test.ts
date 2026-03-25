import { describe, expect, it } from 'vitest';
import * as mockDbModule from '$lib/mock-db';
import { mockDb } from '$lib/mock-db';

describe('mock db architecture', () => {
	it('exposes a single grouped mockDb public surface', () => {
		expect(mockDbModule).toHaveProperty('mockDb');
		expect('records' in mockDb).toBe(false);
		expect('queries' in mockDb).toBe(false);
		expect(Object.keys(mockDb).sort()).toEqual([
			'activities',
			'brokers',
			'contexts',
			'deals',
			'forecasts',
			'insights',
			'meetings',
			'news'
		]);
	});
});
