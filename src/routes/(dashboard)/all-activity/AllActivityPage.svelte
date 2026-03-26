<script lang="ts">
	import type { AllActivityView } from '$lib/dashboard/all-activity-routes';
	import { getDashboardLayoutMaxWidth } from '$lib/dashboard/layout/tokens';
	import { useDashboardHeaderUiController } from '$lib/dashboard/shell/dashboard-header-ui';
	import type { ActivityLevel } from '$lib/domain/activity-level';
	import type { DealIndustry } from '$lib/domain/deals';
	import AllActivityFilterDrawer from './AllActivityFilterDrawer.svelte';
	import AllActivityTable from './AllActivityTable.svelte';
	import LikelyOutOfDateTable from './LikelyOutOfDateTable.svelte';
	import {
		buildAllActivityFilterDrawerSections,
		createDefaultAllActivityFilterExpansionState,
		getAllActivityFilterDrawerData,
		type AllActivityFilterOptionToggle,
		type AllActivityFilterSectionId
	} from './filter-drawer';
	import { ALL_ACTIVITY_HEADER_SCOPE_ID, getAllActivityHeaderUiScope } from './header-ui';
	import type { AllActivityTableRow } from './projection';

	type Props = {
		data: {
			selectedView: AllActivityView;
			rows: readonly AllActivityTableRow[];
		};
	};

	let { data }: Props = $props();
	const headerUiController = useDashboardHeaderUiController();
	const maxWidth = getDashboardLayoutMaxWidth('wide');
	const filterDrawerData = getAllActivityFilterDrawerData();
	let isFilterDrawerOpen = $state(false);
	let expandedSections = $state(createDefaultAllActivityFilterExpansionState());
	let selectedBrokerIds = $state(filterDrawerData.brokers.map((broker) => broker.id));
	let selectedActivityLevels = $state<ActivityLevel[]>(
		filterDrawerData.activityLevels.map((activityLevel) => activityLevel.id)
	);
	let selectedIndustries = $state<DealIndustry[]>(
		filterDrawerData.industries.map((industry) => industry.id)
	);
	const filterDrawerSections = $derived(
		buildAllActivityFilterDrawerSections({
			data: filterDrawerData,
			selectedBrokerIds,
			selectedActivityLevels,
			selectedIndustries,
			expandedSections
		})
	);

	$effect(() => {
		headerUiController.setScope(
			ALL_ACTIVITY_HEADER_SCOPE_ID,
			getAllActivityHeaderUiScope(toggleFilterDrawer)
		);

		return () => {
			headerUiController.clearScope(ALL_ACTIVITY_HEADER_SCOPE_ID);
		};
	});

	function toggleFilterDrawer() {
		isFilterDrawerOpen = !isFilterDrawerOpen;
	}

	function closeFilterDrawer() {
		isFilterDrawerOpen = false;
	}

	function toggleSelectedValue<T extends string>(selectedValues: readonly T[], value: T) {
		return selectedValues.includes(value)
			? selectedValues.filter((selectedValue) => selectedValue !== value)
			: [...selectedValues, value];
	}

	function toggleFilterSection(sectionId: AllActivityFilterSectionId) {
		if (sectionId === 'activity-level') {
			return;
		}

		expandedSections = {
			...expandedSections,
			[sectionId]: !expandedSections[sectionId]
		};
	}

	function toggleFilterOption(toggle: AllActivityFilterOptionToggle) {
		if (toggle.sectionId === 'broker') {
			selectedBrokerIds = toggleSelectedValue(selectedBrokerIds, toggle.optionId);
			return;
		}

		if (toggle.sectionId === 'activity-level') {
			selectedActivityLevels = toggleSelectedValue(selectedActivityLevels, toggle.optionId);
			return;
		}

		selectedIndustries = toggleSelectedValue(selectedIndustries, toggle.optionId);
	}
</script>

<AllActivityFilterDrawer
	open={isFilterDrawerOpen}
	sections={filterDrawerSections}
	onClose={closeFilterDrawer}
	onToggleSection={toggleFilterSection}
	onToggleOption={toggleFilterOption}
/>

<div class="mx-auto w-full" style={`max-width: ${maxWidth};`}>
	<div class="px-4 pt-8 pb-6 sm:px-6 lg:px-8">
		<div class="pt-1">
			{#if data.selectedView === 'likely-out-of-date'}
				<LikelyOutOfDateTable rows={data.rows} />
			{:else}
				<AllActivityTable rows={data.rows} />
			{/if}
		</div>
	</div>
</div>
