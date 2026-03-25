<script lang="ts">
	import { List } from 'lucide-svelte';
	import DashboardDetailLayout from '$lib/dashboard/layout/DashboardDetailLayout.svelte';
	import SectionTabPanel from '$lib/ui/custom/SectionTabPanel.svelte';
	import SectionTabs from '$lib/ui/custom/SectionTabs.svelte';
	import FileUploadField from '$lib/ui/skeleton/FileUploadField.svelte';
	import OrgChartSection from '$lib/ui/custom/OrgChartSection.svelte';
	import TimelineSection from '$lib/ui/custom/TimelineSection.svelte';
	import type { AllActivityDetailView } from './projection';

	type Props = {
		data: AllActivityDetailView;
	};

	let { data }: Props = $props();

	const tabs = [
		{ id: 'activity', label: 'Activity' },
		{ id: 'org-chart', label: 'Org chart' },
		{ id: 'update', label: 'Update' }
	] as const;
</script>

<DashboardDetailLayout hero={data.hero} icon={List} rightRailData={data.rightRail}>
	{#snippet body()}
		<SectionTabs {tabs}>
			<SectionTabPanel tabId="activity">
				<TimelineSection items={data.activityItems} />
			</SectionTabPanel>
			<SectionTabPanel tabId="org-chart">
				<OrgChartSection root={data.orgChartRoot} />
			</SectionTabPanel>
			<SectionTabPanel tabId="update">
				<FileUploadField data={data.update} />
			</SectionTabPanel>
		</SectionTabs>
	{/snippet}
</DashboardDetailLayout>
