import { describe, expect, it } from 'vitest';
import {
	getFilteredIndustryOptions,
	getInitialHighlightedIndustryId,
	getNextHighlightedIndustryId
} from './industry-picker';

const options = [
	{ id: 'Industrials', label: 'Industrials' },
	{ id: 'Transportation & logistics', label: 'Transportation & logistics' },
	{ id: 'Hospitality', label: 'Hospitality' }
] as const;

describe('industry picker helpers', () => {
	it('filters and sorts selected multi-select options first', () => {
		const filteredOptions = getFilteredIndustryOptions({
			options,
			query: 'i',
			selectedValues: ['Hospitality'],
			sortSelectedFirst: true
		});

		expect(filteredOptions.map((option) => option.label)).toEqual([
			'Hospitality',
			'Industrials',
			'Transportation & logistics'
		]);
	});

	it('chooses the selected option as the initial highlight', () => {
		const highlightedIndustryId = getInitialHighlightedIndustryId({
			options,
			selectedValues: ['Hospitality']
		});

		expect(highlightedIndustryId).toBe('Hospitality');
	});

	it('falls back to the first option when nothing is selected', () => {
		const highlightedIndustryId = getInitialHighlightedIndustryId({
			options,
			selectedValues: []
		});

		expect(highlightedIndustryId).toBe('Industrials');
	});

	it('advances and wraps keyboard highlight movement', () => {
		expect(
			getNextHighlightedIndustryId({
				options,
				currentIndustryId: 'Industrials',
				direction: 1
			})
		).toBe('Transportation & logistics');

		expect(
			getNextHighlightedIndustryId({
				options,
				currentIndustryId: 'Industrials',
				direction: -1
			})
		).toBe('Hospitality');
	});

	it('returns no matches for an unmatched query', () => {
		const filteredOptions = getFilteredIndustryOptions({
			options,
			query: 'energy'
		});

		expect(filteredOptions).toEqual([]);
	});
});
