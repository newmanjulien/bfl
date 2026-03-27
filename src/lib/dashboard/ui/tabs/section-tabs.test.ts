import { describe, expect, it } from 'vitest';
import {
	resolveRequestedSectionTabId,
	resolveSelectedSectionTabId
} from './section-tabs';

const selectableTabs = [{ id: 'news' }, { id: 'activity' }, { id: 'update' }] as const;

describe('section-tabs state', () => {
	it('accepts a requested tab only when it is selectable', () => {
		expect(resolveRequestedSectionTabId(selectableTabs, 'activity')).toBe('activity');
		expect(resolveRequestedSectionTabId(selectableTabs, 'missing')).toBe('');
		expect(resolveRequestedSectionTabId(selectableTabs)).toBe('');
	});

	it('prioritizes a changed requested tab over a stale active tab', () => {
		expect(
			resolveSelectedSectionTabId({
				selectableTabs,
				requestedTabId: 'activity',
				syncedRequestedTabId: 'news',
				activeTabId: 'news'
			})
		).toBe('activity');
	});

	it('keeps the user-selected active tab when the requested tab has not changed', () => {
		expect(
			resolveSelectedSectionTabId({
				selectableTabs,
				requestedTabId: 'news',
				syncedRequestedTabId: 'news',
				activeTabId: 'activity'
			})
		).toBe('activity');
	});

	it('falls back to the first selectable tab when nothing else applies', () => {
		expect(
			resolveSelectedSectionTabId({
				selectableTabs,
				requestedTabId: '',
				syncedRequestedTabId: '',
				activeTabId: 'missing'
			})
		).toBe('news');
	});
});
