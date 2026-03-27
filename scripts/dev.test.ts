import { describe, expect, it } from 'vitest';
import {
	CONVEX_READY_TEXT,
	CONVEX_STARTUP_ERROR_TEXT,
	buildViteCommandArgs,
	buildViteEnv,
	createConvexStartupTracker
} from './dev.mjs';

describe('createConvexStartupTracker', () => {
	it('stays pending until Convex reports a successful first push', () => {
		const tracker = createConvexStartupTracker();

		expect(tracker.status).toBe('pending');
		expect(tracker.observe('Preparing Convex functions...\n')).toBe('pending');
		expect(tracker.status).toBe('pending');
	});

	it('marks startup fatal when Convex reports an error before first readiness', () => {
		const tracker = createConvexStartupTracker();

		expect(tracker.observe(`${CONVEX_STARTUP_ERROR_TEXT} Unable to start push`)).toBe('fatal');
		expect(tracker.status).toBe('fatal');
	});

	it('marks startup ready when Convex reports functions ready', () => {
		const tracker = createConvexStartupTracker();

		expect(tracker.observe(`${CONVEX_READY_TEXT} (842ms)`)).toBe('ready');
		expect(tracker.status).toBe('ready');
	});
});

describe('buildViteCommandArgs', () => {
	it('forwards extra Vite args through npm run', () => {
		expect(buildViteCommandArgs(['--open', '--host', '0.0.0.0'])).toEqual([
			'--',
			'--open',
			'--host',
			'0.0.0.0'
		]);
	});
});

describe('buildViteEnv', () => {
	it('preserves explicit PUBLIC_CONVEX_URL overrides', () => {
		const env = buildViteEnv({
			PUBLIC_CONVEX_URL: 'https://example.convex.cloud',
			PUBLIC_CONVEX_SITE_URL: 'https://example.convex.site'
		});

		expect(env.PUBLIC_CONVEX_URL).toBe('https://example.convex.cloud');
		expect(env.PUBLIC_CONVEX_SITE_URL).toBe('https://example.convex.site');
	});
});
