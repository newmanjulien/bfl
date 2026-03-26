import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import IndustryPickerPanel from './IndustryPickerPanel.svelte';

const options = [
	{ id: 'Industrials', label: 'Industrials' },
	{ id: 'Transportation & logistics', label: 'Transportation & logistics' },
	{ id: 'Hospitality', label: 'Hospitality' }
] as const;

describe('industry picker panel', () => {
	it('renders searchable inline multi-select content', () => {
		const html = render(IndustryPickerPanel, {
			props: {
				mode: 'multiple',
				options,
				selectedValues: ['Hospitality', 'Industrials'],
				onSelect: () => {}
			}
		}).body;

		expect(html).toContain('aria-label="Search industries"');
		expect(html).toContain('Transportation &amp; logistics');
		expect(html).toContain('aria-selected="true"');
	});

	it('renders the empty state when there are no options', () => {
		const html = render(IndustryPickerPanel, {
			props: {
				options: [],
				selectedValues: [],
				emptyLabel: 'No options available',
				onSelect: () => {}
			}
		}).body;

		expect(html).toContain('No options available');
		expect(html).not.toContain('role="option"');
	});
});
