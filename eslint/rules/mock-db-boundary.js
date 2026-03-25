import { existsSync } from 'node:fs';
import path from 'node:path';

const FORBIDDEN_DATASET_EXPORTS = new Set([
	'brokersById',
	'brokerRecords',
	'deals',
	'dealBrokerLinks',
	'dealActivities',
	'dealNews',
	'dealInsights',
	'dealForecasts',
	'dealContexts'
]);

const RESOLUTION_CANDIDATES = [
	'',
	'.cjs',
	'.cts',
	'.js',
	'.jsx',
	'.mjs',
	'.mts',
	'.svelte',
	'.ts',
	'.tsx'
];

const INDEX_CANDIDATES = RESOLUTION_CANDIDATES.filter(Boolean).map((extension) => `index${extension}`);

const MOCK_DB_SEGMENT = `${path.sep}src${path.sep}lib${path.sep}mock-db`;
const DASHBOARD_SEGMENT = `${path.sep}src${path.sep}lib${path.sep}dashboard`;

function isWithinSegment(filePath, segment) {
	const normalizedPath = path.normalize(filePath);
	return normalizedPath.includes(`${segment}${path.sep}`) || normalizedPath.endsWith(segment);
}

function resolveRelativeImport(fromFilePath, specifier) {
	if (!specifier.startsWith('.')) {
		return null;
	}

	const basePath = path.resolve(path.dirname(fromFilePath), specifier);
	const candidates = [
		...RESOLUTION_CANDIDATES.map((extension) => `${basePath}${extension}`),
		...INDEX_CANDIDATES.map((indexFile) => path.join(basePath, indexFile))
	];

	return candidates.find((candidatePath) => existsSync(candidatePath)) ?? null;
}

function getStaticSpecifier(sourceNode) {
	if (!sourceNode) {
		return null;
	}

	if (sourceNode.type === 'Literal' && typeof sourceNode.value === 'string') {
		return sourceNode.value;
	}

	if (
		sourceNode.type === 'TemplateLiteral' &&
		sourceNode.expressions.length === 0 &&
		sourceNode.quasis[0]
	) {
		return sourceNode.quasis[0].value.cooked ?? null;
	}

	return null;
}

function reportSpecifierViolation(context, node, message) {
	context.report({
		node,
		message
	});
}

function checkSpecifier(context, sourceNode, specifier, currentFilePath) {
	const isMockDbFile = isWithinSegment(currentFilePath, MOCK_DB_SEGMENT);
	const resolvedImportPath = resolveRelativeImport(currentFilePath, specifier);

	if (!isMockDbFile) {
		if (specifier.startsWith('$lib/mock-db/') || specifier === '$lib/mock-db/index') {
			reportSpecifierViolation(
				context,
				sourceNode,
				'App code must import mock-db only through the $lib/mock-db public boundary.'
			);
		}

		if (resolvedImportPath && isWithinSegment(resolvedImportPath, MOCK_DB_SEGMENT)) {
			reportSpecifierViolation(
				context,
				sourceNode,
				'App code must not reach into src/lib/mock-db through a relative import.'
			);
		}

		return;
	}

	if (specifier.startsWith('$lib/dashboard/') || specifier === '$lib/dashboard/index') {
		reportSpecifierViolation(
			context,
			sourceNode,
			'mock-db must not import dashboard code through the $lib/dashboard boundary.'
		);
	}

	if (resolvedImportPath && isWithinSegment(resolvedImportPath, DASHBOARD_SEGMENT)) {
		reportSpecifierViolation(
			context,
			sourceNode,
			'mock-db must not import dashboard code through a relative import.'
		);
	}
}

function isMockDbRecordsAccess(node) {
	return (
		node.object.type === 'Identifier' &&
		node.object.name === 'mockDb' &&
		((!node.computed && node.property.type === 'Identifier' && node.property.name === 'records') ||
			(node.computed && node.property.type === 'Literal' && node.property.value === 'records'))
	);
}

export default {
	meta: {
		type: 'problem',
		docs: {
			description: 'Enforce the mock-db architecture boundary at lint time.'
		},
		schema: []
	},
	create(context) {
		const currentFilePath = context.filename;
		const isMockDbFile = isWithinSegment(currentFilePath, MOCK_DB_SEGMENT);

		return {
			ImportDeclaration(node) {
				const specifier = getStaticSpecifier(node.source);
				if (specifier) {
					checkSpecifier(context, node.source, specifier, currentFilePath);
				}
			},
			ExportNamedDeclaration(node) {
				if (node.source) {
					const specifier = getStaticSpecifier(node.source);
					if (specifier) {
						checkSpecifier(context, node.source, specifier, currentFilePath);
					}
				}

				if (isMockDbFile || !node.declaration || node.declaration.type !== 'VariableDeclaration') {
					return;
				}

				for (const declarator of node.declaration.declarations) {
					if (
						declarator.id.type === 'Identifier' &&
						FORBIDDEN_DATASET_EXPORTS.has(declarator.id.name)
					) {
						context.report({
							node: declarator.id,
							message:
								'Mock dataset records must stay inside src/lib/mock-db instead of being exported from app code.'
						});
					}
				}
			},
			ExportAllDeclaration(node) {
				const specifier = getStaticSpecifier(node.source);
				if (specifier) {
					checkSpecifier(context, node.source, specifier, currentFilePath);
				}
			},
			ImportExpression(node) {
				const specifier = getStaticSpecifier(node.source);
				if (specifier) {
					checkSpecifier(context, node.source, specifier, currentFilePath);
				}
			},
			CallExpression(node) {
				if (
					node.callee.type === 'Identifier' &&
					node.callee.name === 'require' &&
					node.arguments[0]
				) {
					const specifier = getStaticSpecifier(node.arguments[0]);
					if (specifier) {
						checkSpecifier(context, node.arguments[0], specifier, currentFilePath);
					}
				}
			},
			MemberExpression(node) {
				if (!isMockDbFile && isMockDbRecordsAccess(node)) {
					context.report({
						node,
						message: 'App code must not read mockDb.records directly.'
					});
				}
			}
		};
	}
};
