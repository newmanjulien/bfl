<script lang="ts">
	import type { AllActivityListQueryResult } from '../../../../convex/allActivity';
	import type { AllActivityListRouteRef } from '$lib/dashboard/routing';
	import DashboardPageLayout from '$lib/dashboard/layout/DashboardPageLayout.svelte';
	import DashboardHeaderScope from '$lib/dashboard/shell/header/DashboardHeaderScope.svelte';
	import {
		type DashboardHeaderButtonHandler,
		type DashboardHeaderUiScope
	} from '$lib/dashboard/shell/header/ui-controller';
	import type { ActivityLevel, DealIndustry } from '$lib/types/vocab';
	import Drawer from './filters/Drawer.svelte';
	import Table from './Table.svelte';
	import LikelyOutOfDateTable from './LikelyOutOfDateTable.svelte';
	import {
		createDefaultAllActivityFilterExpansionState,
		type AllActivityFilterDrawerData,
		type AllActivityFilterOptionToggle,
		type AllActivityFilterSectionId
	} from './filters/model';
	import { buildAllActivityFilterDrawerSections } from './filters/sections';

	type AllActivityTableRow = AllActivityListQueryResult['rows'][number];
	type BrokerId = AllActivityFilterDrawerData['brokers'][number]['id'];

	type Props = {
		data: AllActivityListQueryResult & {
			route: AllActivityListRouteRef;
			rows: readonly AllActivityTableRow[];
			filterDrawerData: AllActivityFilterDrawerData;
		};
	};

	const HEADER_SCOPE_ID = 'all-activity-list';

	let { data }: Props = $props();
	const filterDrawerData = $derived(data.filterDrawerData);
	let isFilterDrawerOpen = $state(false);
	let expandedSections = $state(createDefaultAllActivityFilterExpansionState());
	let selectedBrokerIds = $state<BrokerId[]>([]);
	let selectedActivityLevels = $state<ActivityLevel[]>([]);
	let selectedIndustries = $state<DealIndustry[]>([]);
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
		selectedBrokerIds = filterDrawerData.brokers.map((broker) => broker.id);
		selectedActivityLevels = filterDrawerData.activityLevels.map((activityLevel) => activityLevel.id);
		selectedIndustries = filterDrawerData.industries.map((industry) => industry.id);
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

	function getAllActivityHeaderUiScope(
		filterHandler: DashboardHeaderButtonHandler
	): DashboardHeaderUiScope {
		return {
			buttons: [
				{
					id: 'filter',
					label: 'Filter',
					order: 20
				}
			],
			handlers: {
				filter: filterHandler
			}
		};
	}
</script>

<Drawer
	open={isFilterDrawerOpen}
	sections={filterDrawerSections}
	onClose={closeFilterDrawer}
	onToggleSection={toggleFilterSection}
	onToggleOption={toggleFilterOption}
/>

<DashboardHeaderScope
	scopeId={HEADER_SCOPE_ID}
	scope={getAllActivityHeaderUiScope(toggleFilterDrawer)}
/>

<DashboardPageLayout width="wide">
	{#snippet body()}
		<div class="pt-1">
			{#if data.route.view === 'likely-out-of-date'}
				<LikelyOutOfDateTable rows={data.rows} />
			{:else}
				<Table rows={data.rows} />
			{/if}
		</div>
	{/snippet}
</DashboardPageLayout>
