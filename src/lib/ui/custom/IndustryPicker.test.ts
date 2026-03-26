import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import IndustryPicker from './IndustryPicker.svelte';

const options = [
	{ id: 'Industrials', label: 'Industrials' },
	{ id: 'Transportation & logistics', label: 'Transportation & logistics' },
	{ id: 'Hospitality', label: 'Hospitality' }
] as const;

describe('industry picker', () => {
	it('renders the closed trigger with a dialog affordance and selected summary', () => {
		const html = render(IndustryPicker, {
			props: {
				summary: 'Industrials',
				options,
				selectedValue: 'Industrials',
				onSelect: () => {}
			}
		}).body;

		expect(html).toContain('aria-haspopup="dialog"');
		expect(html).toContain('aria-expanded="false"');
		expect(html).toContain('rounded-md border border-zinc-100 bg-zinc-50/70 px-2.5 py-1.5');
		expect(html).toContain('text-[11px] tracking-wide text-zinc-700');
		expect(html).toContain('Industrials');
	});
});
