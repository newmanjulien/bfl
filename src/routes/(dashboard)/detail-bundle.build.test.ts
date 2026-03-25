import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = fileURLToPath(new URL('../../..', import.meta.url));
const generatedClientAppPath = join(repoRoot, '.svelte-kit', 'generated', 'client-optimized', 'app.js');
const clientOutputRoot = join(repoRoot, '.svelte-kit', 'output', 'client');
const clientManifestPath = join(clientOutputRoot, '.vite', 'manifest.json');
const svelteStartEntryId = 'node_modules/@sveltejs/kit/src/runtime/client/entry.js';
const svelteAppEntryId = '.svelte-kit/generated/client-optimized/app.js';
const rootLayoutNodeId = 0;

const detailRouteBudgets = [
	{
		label: 'all-activity detail route',
		routeId: '/(dashboard)/all-activity/detail/[detailId]',
		maxInitialJsGzipBytes: 140_000
	},
	{
		label: 'my-deals detail route',
		routeId: '/(dashboard)/my-deals/detail/[detailId]',
		maxInitialJsGzipBytes: 140_000
	},
	{
		label: 'opportunities detail route',
		routeId: '/(dashboard)/opportunities/detail/[detailId]',
		maxInitialJsGzipBytes: 135_000
	}
] as const;

type ClientManifestEntry = {
	file: string;
	imports?: string[];
};

type ClientRouteDictionary = Record<string, [number, number[]?]>;

function loadClientManifest() {
	return JSON.parse(readFileSync(clientManifestPath, 'utf8')) as Record<string, ClientManifestEntry>;
}

async function loadClientRouteDictionary() {
	const { dictionary } = (await import(
		`${pathToFileURL(generatedClientAppPath).href}?t=${Date.now()}`
	)) as { dictionary: ClientRouteDictionary };

	return dictionary;
}

function decodeNodeId(encodedNodeId: number) {
	return encodedNodeId < 0 ? ~encodedNodeId : encodedNodeId;
}

function collectManifestDependencies(
	manifest: Record<string, ClientManifestEntry>,
	entryId: string,
	seenEntryIds = new Set<string>()
) {
	if (seenEntryIds.has(entryId)) {
		return seenEntryIds;
	}

	const entry = manifest[entryId];

	if (!entry) {
		throw new Error(`Missing client manifest entry for ${entryId}.`);
	}

	seenEntryIds.add(entryId);

	for (const importedEntryId of entry.imports ?? []) {
		collectManifestDependencies(manifest, importedEntryId, seenEntryIds);
	}

	return seenEntryIds;
}

function measureManifestEntries(
	manifest: Record<string, ClientManifestEntry>,
	entryIds: Iterable<string>
) {
	let rawBytes = 0;
	let gzipBytes = 0;

	for (const entryId of entryIds) {
		const entry = manifest[entryId];

		if (!entry) {
			throw new Error(`Missing client manifest entry for ${entryId}.`);
		}

		const chunkPath = join(clientOutputRoot, entry.file);
		const fileContents = readFileSync(chunkPath);

		rawBytes += fileContents.length;
		gzipBytes += gzipSync(fileContents).length;
	}

	return { rawBytes, gzipBytes };
}

describe('dashboard detail route bundle budgets', () => {
	it('keeps the client manifest available after a production build', () => {
		expect(() => loadClientManifest()).not.toThrow();
	});

	for (const { label, routeId, maxInitialJsGzipBytes } of detailRouteBudgets) {
		it(`keeps the ${label} under ${Math.round(maxInitialJsGzipBytes / 1000)} kB gzipped`, async () => {
			const manifest = loadClientManifest();
			const dictionary = await loadClientRouteDictionary();
			const routeNodes = dictionary[routeId];

			expect(routeNodes).toBeDefined();

			if (!routeNodes) {
				return;
			}

			const [leafNode, layoutNodes = []] = routeNodes;
			const seededEntryIds = [
				svelteStartEntryId,
				svelteAppEntryId,
				`.svelte-kit/generated/client-optimized/nodes/${rootLayoutNodeId}.js`,
				...layoutNodes.map((nodeId) => `.svelte-kit/generated/client-optimized/nodes/${decodeNodeId(nodeId)}.js`),
				`.svelte-kit/generated/client-optimized/nodes/${decodeNodeId(leafNode)}.js`
			];
			const routeEntryIds = new Set<string>();

			for (const entryId of seededEntryIds) {
				collectManifestDependencies(manifest, entryId, routeEntryIds);
			}

			const { rawBytes, gzipBytes } = measureManifestEntries(manifest, routeEntryIds);

			expect(gzipBytes, `${routeId} raw=${rawBytes} gzip=${gzipBytes}`).toBeLessThanOrEqual(
				maxInitialJsGzipBytes
			);
		});
	}
});
