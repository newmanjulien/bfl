import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import AllActivityFilterDrawer from './AllActivityFilterDrawer.svelte';
import {
	buildAllActivityFilterDrawerSections,
	createDefaultAllActivityFilterExpansionState,
	getAllActivityFilterDrawerData
} from './filter-drawer';

describe('all-activity filter drawer', () => {
	it('renders the provided sections and preserves the collapsed industry section shell', () => {
		const data = getAllActivityFilterDrawerData();
		const sections = buildAllActivityFilterDrawerSections({
			data,
			selectedBrokerIds: data.brokers.map((broker) => broker.id),
			selectedActivityLevels: data.activityLevels.map((activityLevel) => activityLevel.id),
			selectedIndustries: data.industries.map((industry) => industry.id),
			expandedSections: createDefaultAllActivityFilterExpansionState()
		});
		const html = render(AllActivityFilterDrawer, {
			props: {
				open: true,
				sections,
				onClose: () => {},
				onToggleSection: () => {},
				onToggleOption: () => {}
			}
		}).body;

		expect(html).toContain('data-all-activity-filter-drawer');
		expect(html).toContain('data-all-activity-filter-section="broker"');
		expect(html).toContain('data-all-activity-filter-section="activity-level"');
		expect(html).toContain('data-all-activity-filter-section="industry"');
		expect(html).toContain('data-all-activity-filter-summary="broker"');
		expect(html).toContain('data-all-activity-filter-summary="activity-level"');
		expect(html).toContain('data-all-activity-filter-summary="industry"');
		expect(html).toContain('aria-label="Search brokers"');
		expect(html).toContain('>Industry</p>');
		expect(html).not.toContain('aria-label="Search industries"');
		expect(html).toContain('aria-label="Search brokers"');
		expect(html).toContain('disabled');
		expect((html.match(/aria-expanded="true"/g) ?? []).length).toBe(1);
		expect((html.match(/aria-expanded="false"/g) ?? []).length).toBe(1);
	});

	it('renders the industry search panel when the industry section is expanded', () => {
		const data = getAllActivityFilterDrawerData();
		const sections = buildAllActivityFilterDrawerSections({
			data,
			selectedBrokerIds: data.brokers.map((broker) => broker.id),
			selectedActivityLevels: data.activityLevels.map((activityLevel) => activityLevel.id),
			selectedIndustries: ['Consumer goods'],
			expandedSections: {
				broker: true,
				'activity-level': true,
				industry: true
			}
		});
		const html = render(AllActivityFilterDrawer, {
			props: {
				open: true,
				sections,
				onClose: () => {},
				onToggleSection: () => {},
				onToggleOption: () => {}
			}
		}).body;

		expect(html).toContain('aria-label="Search industries"');
		expect(html).toContain('Consumer goods');
		expect(html).toContain('Transportation &amp; logistics');
		expect((html.match(/aria-expanded="true"/g) ?? []).length).toBe(2);
	});

	it('does not render when closed', () => {
		const data = getAllActivityFilterDrawerData();
		const sections = buildAllActivityFilterDrawerSections({
			data,
			selectedBrokerIds: data.brokers.map((broker) => broker.id),
			selectedActivityLevels: data.activityLevels.map((activityLevel) => activityLevel.id),
			selectedIndustries: data.industries.map((industry) => industry.id),
			expandedSections: createDefaultAllActivityFilterExpansionState()
		});
		const html = render(AllActivityFilterDrawer, {
			props: {
				open: false,
				sections,
				onClose: () => {},
				onToggleSection: () => {},
				onToggleOption: () => {}
			}
		}).body;

		expect(html).not.toContain('data-all-activity-filter-drawer');
	});
});
