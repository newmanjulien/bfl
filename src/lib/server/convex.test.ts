import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CONVEX_UNAVAILABLE_ERROR_CODE } from '$lib/convex/errors';

const mocks = vi.hoisted(() => ({
	env: { PUBLIC_CONVEX_URL: undefined as string | undefined },
	clientUrl: undefined as string | undefined,
	fetch: undefined as typeof fetch | undefined,
	query: vi.fn(),
	mutation: vi.fn(),
	action: vi.fn(),
	consoleError: vi.fn()
}));

vi.mock('$env/dynamic/public', () => ({
	env: mocks.env
}));

vi.mock('convex/browser', () => ({
	ConvexHttpClient: class MockConvexHttpClient {
		query = mocks.query;
		mutation = mocks.mutation;
		action = mocks.action;

		constructor(url: string, options?: { fetch?: typeof fetch }) {
			mocks.clientUrl = url;
			mocks.fetch = options?.fetch;
		}
	}
}));

import {
	CONVEX_URL_ENV_VAR,
	CONVEX_INVALID_URL_MESSAGE,
	CONVEX_MISSING_URL_MESSAGE,
	CONVEX_UNAVAILABLE_MESSAGE,
	createConvexFetch,
	createServerConvexClient,
	isConvexBackendUnavailableError,
	resolveServerConvexUrl
} from './convex';

function expectHttpError(
	caught: unknown,
	status: number,
	message: string
): asserts caught is { status: number; body: { message: string; code?: string } } {
	expect(caught).toMatchObject({
		status,
		body: {
			message
		}
	});
}

describe('server Convex client', () => {
	beforeEach(() => {
		mocks.env.PUBLIC_CONVEX_URL = undefined;
		mocks.clientUrl = undefined;
		mocks.fetch = undefined;
		mocks.query.mockReset();
		mocks.mutation.mockReset();
		mocks.action.mockReset();
		mocks.consoleError.mockReset();

		vi.spyOn(console, 'error').mockImplementation(mocks.consoleError);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it(`requires a ${CONVEX_URL_ENV_VAR} server env var`, () => {
		try {
			resolveServerConvexUrl();
			throw new Error('Expected resolveServerConvexUrl to throw.');
		} catch (caught) {
			expectHttpError(caught, 503, CONVEX_MISSING_URL_MESSAGE);
		}
	});

	it(`rejects invalid ${CONVEX_URL_ENV_VAR} values`, () => {
		try {
			resolveServerConvexUrl({ PUBLIC_CONVEX_URL: 'not-a-url' });
			throw new Error('Expected resolveServerConvexUrl to throw.');
		} catch (caught) {
			expectHttpError(caught, 503, CONVEX_INVALID_URL_MESSAGE);
		}
	});

	it('creates the client with the public SvelteKit url', () => {
		mocks.env.PUBLIC_CONVEX_URL = 'http://127.0.0.1:3210';

		createServerConvexClient();

		expect(mocks.clientUrl).toBe('http://127.0.0.1:3210');
		expect(mocks.fetch).toBeTypeOf('function');
	});

	it('maps backend fetch failures to service unavailable errors', async () => {
		mocks.env.PUBLIC_CONVEX_URL = 'http://127.0.0.1:3210';
		mocks.query.mockRejectedValue(new TypeError('fetch failed'));

		const client = createServerConvexClient();

		await expect(client.query('ignored' as never)).rejects.toMatchObject({
			status: 503,
			body: {
				message: CONVEX_UNAVAILABLE_MESSAGE,
				code: CONVEX_UNAVAILABLE_ERROR_CODE
			}
		});

		expect(mocks.consoleError).toHaveBeenCalled();
	});

	it('maps non-ok HTTP responses from the Convex endpoint to availability errors', async () => {
		const wrappedFetch = createConvexFetch(async () => {
			return new Response('Bad Gateway', {
				status: 502,
				statusText: 'Bad Gateway'
			});
		});

		try {
			await wrappedFetch('http://127.0.0.1:3210/api/query', { method: 'POST' });
			throw new Error('Expected createConvexFetch to throw.');
		} catch (caught) {
			expect(isConvexBackendUnavailableError(caught)).toBe(true);
		}
	});

	it('maps missing public function errors to service unavailable errors', async () => {
		mocks.env.PUBLIC_CONVEX_URL = 'http://127.0.0.1:3210';
		mocks.query.mockRejectedValue(
			new Error(
				"[Request ID: abc] Server Error Could not find public function for 'shell:getDashboardShell'. Did you forget to run `npx convex dev` or `npx convex deploy`?"
			)
		);

		const client = createServerConvexClient();

		await expect(client.query('ignored' as never)).rejects.toMatchObject({
			status: 503,
			body: {
				message: CONVEX_UNAVAILABLE_MESSAGE,
				code: CONVEX_UNAVAILABLE_ERROR_CODE
			}
		});
	});

	it('rethrows non-network Convex errors unchanged', async () => {
		mocks.env.PUBLIC_CONVEX_URL = 'http://127.0.0.1:3210';

		const failure = new Error('unexpected query failure');
		mocks.query.mockRejectedValue(failure);

		const client = createServerConvexClient();

		await expect(client.query('ignored' as never)).rejects.toBe(failure);
	});
});
