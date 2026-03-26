import { ACTIVITY_LEVELS, type ActivityLevel } from '$lib/domain/activity-level';
import { DEAL_INDUSTRIES, type DealIndustry } from '$lib/domain/deals';
import type { PersonSummary } from '$lib/domain/people';
import {
	getActivityLevelIconVariant,
	getActivityLevelLabel,
	type ActivityLevelIconVariant
} from '$lib/presentation/activity-level';
import { mockDb } from '$lib/mock-db';

export type AllActivityFilterDrawerData = {
	brokers: readonly PersonSummary[];
	activityLevels: readonly {
		id: ActivityLevel;
		label: string;
	}[];
	industries: readonly {
		id: DealIndustry;
		label: string;
	}[];
};

export type AllActivityFilterSectionId = 'broker' | 'activity-level' | 'industry';
export type AllActivityFilterOptionIdBySection = {
	broker: PersonSummary['id'];
	'activity-level': ActivityLevel;
	industry: DealIndustry;
};
export type AllActivityFilterOptionId =
	AllActivityFilterOptionIdBySection[AllActivityFilterSectionId];
export type AllActivityFilterExpansionState = Record<AllActivityFilterSectionId, boolean>;
export type AllActivityFilterOptionToggle = {
	[SectionId in AllActivityFilterSectionId]: {
		sectionId: SectionId;
		optionId: AllActivityFilterOptionIdBySection[SectionId];
	};
}[AllActivityFilterSectionId];

export type AllActivityFilterSearch = {
	label: string;
	placeholder: string;
	disabled: true;
};

type BaseFilterOption<SectionId extends AllActivityFilterSectionId> = {
	id: AllActivityFilterOptionIdBySection[SectionId];
	label: string;
	selected: boolean;
};

export type AllActivityBrokerFilterOption = BaseFilterOption<'broker'> & {
	avatar: string;
};

export type AllActivityActivityLevelFilterOption = BaseFilterOption<'activity-level'> & {
	iconVariant: ActivityLevelIconVariant;
};

export type AllActivityIndustryFilterOption = BaseFilterOption<'industry'>;

type BaseSection<Id extends AllActivityFilterSectionId, Option> = {
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
> & {
	search: AllActivityFilterSearch;
};

export type AllActivityFilterDrawerSection =
	| AllActivityBrokerFilterSection
	| AllActivityActivityLevelFilterSection
	| AllActivityIndustryFilterSection;

type BuildAllActivityFilterDrawerSectionsParams = {
	data: AllActivityFilterDrawerData;
	selectedBrokerIds: readonly PersonSummary['id'][];
	selectedActivityLevels: readonly ActivityLevel[];
	selectedIndustries: readonly DealIndustry[];
	expandedSections: AllActivityFilterExpansionState;
};

export function getAllActivityFilterDrawerData(): AllActivityFilterDrawerData {
	const brokers: readonly PersonSummary[] = mockDb.brokers
		.list()
		.map(({ id, name, avatar }) => ({ id, name, avatar }));
	const activityLevels = ACTIVITY_LEVELS.map((activityLevel) => ({
		id: activityLevel,
		label: getActivityLevelLabel(activityLevel)
	}));
	const dealIndustries = new Set(mockDb.deals.list().map((deal) => deal.industry));
	const industries = DEAL_INDUSTRIES.filter((industry) => dealIndustries.has(industry)).map(
		(industry) => ({
			id: industry,
			label: industry
		})
	);

	return {
		brokers,
		activityLevels,
		industries
	};
}

export function createDefaultAllActivityFilterExpansionState(): AllActivityFilterExpansionState {
	return {
		broker: true,
		'activity-level': true,
		industry: false
	};
}

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
		search: {
			label: 'Search industries',
			placeholder: 'Search industries',
			disabled: true
		},
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
