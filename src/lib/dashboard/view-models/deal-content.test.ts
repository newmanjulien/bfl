import { describe, expect, it } from 'vitest';
import type { OrgChartNodeRecord } from '$lib/domain/org-chart';
import type { BrokerId } from '$lib/types/ids';
import { createPersonSummaryMap, toOrgChartRoot } from './deal-content';

const julienBrokerId = 'broker-julien' as BrokerId;
const minaBrokerId = 'broker-mina' as BrokerId;

const peopleById = createPersonSummaryMap([
	{
		id: julienBrokerId,
		name: 'Julien Newman',
		avatar: '/avatars/julien.png'
	},
	{
		id: minaBrokerId,
		name: 'Mina Chen',
		avatar: '/avatars/mina.png'
	}
]);

function createOrgChartNode(
	overrides: Partial<OrgChartNodeRecord> &
		Pick<OrgChartNodeRecord, 'id' | 'name' | 'role'>
): OrgChartNodeRecord {
	const { id, name, role, ...rest } = overrides;

	return {
		id,
		name,
		role,
		lastContactedByBrokerId: julienBrokerId,
		lastContactedOnIso: '2026-03-21',
		...rest
	};
}

describe('toOrgChartRoot', () => {
	it('rebuilds a nested org chart from flat nodes', () => {
		const root = toOrgChartRoot(
			[
				createOrgChartNode({ id: 'root', name: 'Alex Morgan', role: 'CFO' }),
				createOrgChartNode({
					id: 'vp-finance',
					parentId: 'root',
					name: 'Taylor Smith',
					role: 'VP Finance',
					lastContactedByBrokerId: minaBrokerId,
					lastContactedOnIso: '2026-03-22'
				}),
				createOrgChartNode({
					id: 'cio',
					parentId: 'root',
					name: 'Morgan Ellis',
					role: 'CIO'
				}),
				createOrgChartNode({
					id: 'controller',
					parentId: 'vp-finance',
					name: 'Jordan Lee',
					role: 'Controller'
				})
			],
			peopleById
		);

		expect(root).toEqual({
			id: 'root',
			name: 'Alex Morgan',
			role: 'CFO',
			lastContacted: {
				by: 'Julien Newman',
				on: 'March 21, 2026'
			},
			directReports: [
				{
					id: 'vp-finance',
					name: 'Taylor Smith',
					role: 'VP Finance',
					lastContacted: {
						by: 'Mina Chen',
						on: 'March 22, 2026'
					},
					directReports: [
						{
							id: 'controller',
							name: 'Jordan Lee',
							role: 'Controller',
							lastContacted: {
								by: 'Julien Newman',
								on: 'March 21, 2026'
							}
						}
					]
				},
				{
					id: 'cio',
					name: 'Morgan Ellis',
					role: 'CIO',
					lastContacted: {
						by: 'Julien Newman',
						on: 'March 21, 2026'
					}
				}
			]
		});
	});

	it('preserves sibling order from the flat node array', () => {
		const root = toOrgChartRoot(
			[
				createOrgChartNode({ id: 'root', name: 'Alex Morgan', role: 'CFO' }),
				createOrgChartNode({
					id: 'cio',
					parentId: 'root',
					name: 'Morgan Ellis',
					role: 'CIO'
				}),
				createOrgChartNode({
					id: 'vp-finance',
					parentId: 'root',
					name: 'Taylor Smith',
					role: 'VP Finance'
				})
			],
			peopleById
		);

		expect(root.directReports?.map((node) => node.id)).toEqual(['cio', 'vp-finance']);
	});

	it('throws when the flat node array has no root', () => {
		expect(() =>
			toOrgChartRoot(
				[
					createOrgChartNode({
						id: 'vp-finance',
						parentId: 'root',
						name: 'Taylor Smith',
						role: 'VP Finance'
					})
				],
				peopleById
			)
		).toThrow('Missing root org chart node.');
	});

	it('throws when the flat node array has multiple roots', () => {
		expect(() =>
			toOrgChartRoot(
				[
					createOrgChartNode({ id: 'root-a', name: 'Alex Morgan', role: 'CFO' }),
					createOrgChartNode({ id: 'root-b', name: 'Taylor Smith', role: 'CIO' })
				],
				peopleById
			)
		).toThrow(/Expected exactly one root org chart node/);
	});

	it('throws when a parent reference is missing', () => {
		expect(() =>
			toOrgChartRoot(
				[
					createOrgChartNode({ id: 'root', name: 'Alex Morgan', role: 'CFO' }),
					createOrgChartNode({
						id: 'controller',
						parentId: 'missing-parent',
						name: 'Jordan Lee',
						role: 'Controller'
					})
				],
				peopleById
			)
		).toThrow('Unknown parent org chart node "missing-parent" for "controller".');
	});

	it('throws when node ids are duplicated', () => {
		expect(() =>
			toOrgChartRoot(
				[
					createOrgChartNode({ id: 'root', name: 'Alex Morgan', role: 'CFO' }),
					createOrgChartNode({
						id: 'root',
						parentId: 'root',
						name: 'Taylor Smith',
						role: 'VP Finance'
					})
				],
				peopleById
			)
		).toThrow('Duplicate org chart node id "root".');
	});

	it('throws when nodes are not reachable from the root, including disconnected cycles', () => {
		expect(() =>
			toOrgChartRoot(
				[
					createOrgChartNode({ id: 'root', name: 'Alex Morgan', role: 'CFO' }),
					createOrgChartNode({
						id: 'finance-a',
						parentId: 'finance-b',
						name: 'Taylor Smith',
						role: 'VP Finance'
					}),
					createOrgChartNode({
						id: 'finance-b',
						parentId: 'finance-a',
						name: 'Jordan Lee',
						role: 'Controller'
					})
				],
					peopleById
				)
		).toThrow('Org chart nodes are not reachable from root "root": finance-a, finance-b.');
	});
});
