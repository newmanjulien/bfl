import { getActivityLevelLabel } from '$lib/dashboard/view-models/deal';
import { ACTIVITY_LEVELS, DEAL_INDUSTRIES, type ActivityLevel, type DealIndustry } from '$lib/types/vocab';
import type { AllActivityListPageData } from '$lib/dashboard/page-models/allActivity';

export type AllActivityFilterDrawerData = AllActivityListPageData['filterDrawerData'];

type BrokerOption = AllActivityFilterDrawerData['brokers'][number];

export type AllActivityFilterSectionId = 'broker' | 'activity-level' | 'industry';

export type AllActivityFilterOptionIdBySection = {
	broker: BrokerOption['id'];
	'activity-level': ActivityLevel;
	industry: DealIndustry;
};

export type AllActivityFilterExpansionState = Record<AllActivityFilterSectionId, boolean>;

export type AllActivityFilterOptionToggle = {
	[SectionId in AllActivityFilterSectionId]: {
		sectionId: SectionId;
		optionId: AllActivityFilterOptionIdBySection[SectionId];
	};
}[AllActivityFilterSectionId];

type CreateAllActivityFilterDrawerDataParams = {
	brokers: readonly BrokerOption[];
	industries: readonly DealIndustry[];
};

export function createAllActivityFilterDrawerData(
	params: CreateAllActivityFilterDrawerDataParams
): AllActivityFilterDrawerData {
	const activityLevels = ACTIVITY_LEVELS.map((activityLevel) => ({
		id: activityLevel,
		label: getActivityLevelLabel(activityLevel)
	}));
	const availableIndustries = new Set(params.industries);
	const industries = DEAL_INDUSTRIES.filter((industry) => availableIndustries.has(industry)).map(
		(industry) => ({
			id: industry,
			label: industry
		})
	);

	return {
		brokers: [...params.brokers],
		activityLevels,
		industries
	};
}

export function createDefaultAllActivityFilterExpansionState(): AllActivityFilterExpansionState {
	return {
		broker: true,
		'activity-level': false,
		industry: false
	};
}
