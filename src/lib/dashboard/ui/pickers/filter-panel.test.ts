import { describe, expect, it } from 'vitest';
import {
	getFilteredOptions,
	getInitialHighlightedOptionId,
	getNextHighlightedOptionId
} from './filter-panel';

const options = [
	{ id: 'industrials', label: 'Industrials' },
	{ id: 'transportation', label: 'Transportation & logistics' },
	{ id: 'hospitality', label: 'Hospitality' }
] as const;

describe('filter panel helpers', () => {
	it('filters and sorts selected multi-select options first', () => {
		const filteredOptions = getFilteredOptions({
			options,
			query: 'i',
			selectedValues: ['hospitality'],
			sortSelectedFirst: true
		});

		expect(filteredOptions.map((option) => option.label)).toEqual([
			'Hospitality',
			'Industrials',
			'Transportation & logistics'
		]);
	});

	it('keeps the original order when selected-first sorting is disabled', () => {
		const filteredOptions = getFilteredOptions({
			options,
			query: 'i',
			selectedValues: ['hospitality'],
			sortSelectedFirst: false
		});

		expect(filteredOptions.map((option) => option.label)).toEqual([
			'Industrials',
			'Transportation & logistics',
			'Hospitality'
		]);
	});

	it('chooses the selected option as the initial highlight', () => {
		const highlightedOptionId = getInitialHighlightedOptionId({
			options,
			selectedValues: ['hospitality']
		});

		expect(highlightedOptionId).toBe('hospitality');
	});

	it('falls back to the first option when nothing is selected', () => {
		const highlightedOptionId = getInitialHighlightedOptionId({
			options,
			selectedValues: []
		});

		expect(highlightedOptionId).toBe('industrials');
	});

	it('advances and wraps keyboard highlight movement', () => {
		expect(
			getNextHighlightedOptionId({
				options,
				currentOptionId: 'industrials',
				direction: 1
			})
		).toBe('transportation');

		expect(
			getNextHighlightedOptionId({
				options,
				currentOptionId: 'industrials',
				direction: -1
			})
		).toBe('hospitality');
	});

	it('returns no matches for an unmatched query', () => {
		const filteredOptions = getFilteredOptions({
			options,
			query: 'energy'
		});

		expect(filteredOptions).toEqual([]);
	});
});
