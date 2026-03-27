import {
	getActivityLevelIconVariant,
	type ActivityLevelIconVariant
} from '$lib/dashboard/view-models/deal';
import type { ActivityLevel, DealIndustry } from '$lib/types/vocab';
import type {
	AllActivityFilterDrawerData,
	AllActivityFilterExpansionState
} from './model';

type BrokerOption = AllActivityFilterDrawerData['brokers'][number];

export type AllActivityFilterSearch = {
	label: string;
	placeholder: string;
	disabled: true;
};

type BaseFilterOption<Id, Extra = object> = {
	id: Id;
	label: string;
	selected: boolean;
} & Extra;

export type AllActivityBrokerFilterOption = BaseFilterOption<
	BrokerOption['id'],
	{ avatar: string }
>;

export type AllActivityActivityLevelFilterOption = BaseFilterOption<
	ActivityLevel,
	{ iconVariant: ActivityLevelIconVariant }
>;

export type AllActivityIndustryFilterOption = BaseFilterOption<DealIndustry>;

type BaseSection<Id extends string, Option> = {
	id: Id;
	title: string;
	summary: string;
	expanded: boolean;
	collapsible: boolean;
	options: readonly Option[];
	search?: AllActivityFilterSearch;
};

export type AllActivityBrokerFilterSection = BaseSection<
	'broker',
	AllActivityBrokerFilterOption
> & {
	search: AllActivityFilterSearch;
};

export type AllActivityActivityLevelFilterSection = BaseSection<
	'activity-level',
	AllActivityActivityLevelFilterOption
>;

export type AllActivityIndustryFilterSection = BaseSection<
	'industry',
	AllActivityIndustryFilterOption
>;

export type AllActivityFilterDrawerSection =
	| AllActivityBrokerFilterSection
	| AllActivityActivityLevelFilterSection
	| AllActivityIndustryFilterSection;

type BuildAllActivityFilterDrawerSectionsParams = {
	data: AllActivityFilterDrawerData;
	selectedBrokerIds: readonly BrokerOption['id'][];
	selectedActivityLevels: readonly ActivityLevel[];
	selectedIndustries: readonly DealIndustry[];
	expandedSections: AllActivityFilterExpansionState;
};

function getSectionSummary(selectedCount: number) {
	if (selectedCount === 0) {
		return 'None';
	}

	return `${selectedCount} selected`;
}

function sortSelectedOptions<Option extends { selected: boolean; label: string }>(
	options: readonly Option[]
) {
	return [...options].sort((left, right) => {
		if (left.selected !== right.selected) {
			return left.selected ? -1 : 1;
		}

		return left.label.localeCompare(right.label);
	});
}

function buildBrokerSection(
	params: BuildAllActivityFilterDrawerSectionsParams
): AllActivityBrokerFilterSection {
	const options = sortSelectedOptions(
		params.data.brokers.map((broker) => ({
			id: broker.id,
			label: broker.name,
			selected: params.selectedBrokerIds.includes(broker.id),
			avatar: broker.avatar
		}))
	);

	return {
		id: 'broker',
		title: 'Broker',
		summary: getSectionSummary(params.selectedBrokerIds.length),
		expanded: params.expandedSections.broker,
		collapsible: true,
		search: {
			label: 'Search brokers',
			placeholder: 'Search brokers',
			disabled: true
		},
		options
	};
}

function buildActivityLevelSection(
	params: BuildAllActivityFilterDrawerSectionsParams
): AllActivityActivityLevelFilterSection {
	return {
		id: 'activity-level',
		title: 'Activity level',
		summary: getSectionSummary(params.selectedActivityLevels.length),
		expanded: true,
		collapsible: false,
		options: params.data.activityLevels.map((activityLevel) => ({
			id: activityLevel.id,
			label: activityLevel.label,
			selected: params.selectedActivityLevels.includes(activityLevel.id),
			iconVariant: getActivityLevelIconVariant(activityLevel.id)
		}))
	};
}

function buildIndustrySection(
	params: BuildAllActivityFilterDrawerSectionsParams
): AllActivityIndustryFilterSection {
	const options = sortSelectedOptions(
		params.data.industries.map((industry) => ({
			id: industry.id,
			label: industry.label,
			selected: params.selectedIndustries.includes(industry.id)
		}))
	);

	return {
		id: 'industry',
		title: 'Industry',
		summary: getSectionSummary(params.selectedIndustries.length),
		expanded: params.expandedSections.industry,
		collapsible: true,
		options
	};
}

export function buildAllActivityFilterDrawerSections(
	params: BuildAllActivityFilterDrawerSectionsParams
): readonly AllActivityFilterDrawerSection[] {
	return [
		buildBrokerSection(params),
		buildActivityLevelSection(params),
		buildIndustrySection(params)
	];
}
