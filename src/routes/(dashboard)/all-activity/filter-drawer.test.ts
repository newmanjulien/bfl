import { describe, expect, it } from 'vitest';
import {
	buildAllActivityFilterDrawerSections,
	createDefaultAllActivityFilterExpansionState,
	getAllActivityFilterDrawerData
} from './filter-drawer';

describe('all-activity filter drawer data', () => {
	it('derives broker, activity-level, and industry options from the mock data', () => {
		const data = getAllActivityFilterDrawerData();

		expect(data.brokers.map((broker) => broker.id)).toEqual(['julien', 'yash']);
		expect(data.activityLevels.map((activityLevel) => activityLevel.id)).toEqual([
			'high',
			'medium',
			'low'
		]);
		expect(data.industries.map((industry) => industry.id)).toEqual([
			'Industrials',
			'Transportation & logistics',
			'Hospitality',
			'Consumer goods',
			'Food & beverage'
		]);
	});

	it('builds default sections with summaries, expansion state, and search config where needed', () => {
		const data = getAllActivityFilterDrawerData();
		const sections = buildAllActivityFilterDrawerSections({
			data,
			selectedBrokerIds: data.brokers.map((broker) => broker.id),
			selectedActivityLevels: data.activityLevels.map((activityLevel) => activityLevel.id),
			selectedIndustries: data.industries.map((industry) => industry.id),
			expandedSections: createDefaultAllActivityFilterExpansionState()
		});

		expect(
			sections.map((section) => ({
				id: section.id,
				summary: section.summary,
				expanded: section.expanded,
				collapsible: section.collapsible,
				searchLabel: section.search?.label ?? null
			}))
		).toEqual([
			{
				id: 'broker',
				summary: '2 selected',
				expanded: true,
				collapsible: true,
				searchLabel: 'Search brokers'
			},
			{
				id: 'activity-level',
				summary: '3 selected',
				expanded: true,
				collapsible: false,
				searchLabel: null
			},
			{
				id: 'industry',
				summary: '5 selected',
				expanded: false,
				collapsible: true,
				searchLabel: null
			}
		]);
	});

	it('orders broker and industry options with selected items first', () => {
		const data = getAllActivityFilterDrawerData();
		const sections = buildAllActivityFilterDrawerSections({
			data,
			selectedBrokerIds: ['yash'],
			selectedActivityLevels: ['high', 'medium', 'low'],
			selectedIndustries: ['Consumer goods'],
			expandedSections: {
				broker: true,
				'activity-level': true,
				industry: true
			}
		});

		const brokerSection = sections.find((section) => section.id === 'broker');
		const activityLevelSection = sections.find((section) => section.id === 'activity-level');
		const industrySection = sections.find((section) => section.id === 'industry');

		if (!brokerSection || !activityLevelSection || !industrySection) {
			throw new Error('Expected broker, activity-level, and industry sections.');
		}

		expect(brokerSection.options.map((option) => option.label)).toEqual([
			'Yash Patel',
			'Julien Newman'
		]);
		expect(activityLevelSection.options.map((option) => option.label)).toEqual([
			'High activity',
			'Medium activity',
			'Low activity'
		]);
		expect(industrySection.options.map((option) => option.label)).toEqual([
			'Consumer goods',
			'Food & beverage',
			'Hospitality',
			'Industrials',
			'Transportation & logistics'
		]);
	});
});
