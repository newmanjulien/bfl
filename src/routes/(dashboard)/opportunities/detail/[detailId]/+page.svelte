<script lang="ts">
	import { Lightbulb, TriangleAlert } from 'lucide-svelte';
	import DashboardDetailLayout from '$lib/dashboard/layout/DashboardDetailLayout.svelte';
	import SectionTabPanel from '$lib/ui/custom/SectionTabPanel.svelte';
	import SectionTabs from '$lib/ui/custom/SectionTabs.svelte';
	import FileUploadField from '$lib/ui/skeleton/FileUploadField.svelte';
	import OrgChartSection from '$lib/ui/custom/OrgChartSection.svelte';
	import TimelineSection from '$lib/ui/custom/TimelineSection.svelte';

	let { data } = $props();

	const tabs = [
		{ id: 'activity', label: 'Activity' },
		{ id: 'org-chart', label: 'Org chart' },
		{ id: 'update', label: 'Update' }
	] as const;

	const detailIcon = $derived(data.kind === 'opportunity' ? Lightbulb : TriangleAlert);
</script>

<DashboardDetailLayout hero={data.hero} icon={detailIcon} rightRailData={data.rightRail}>
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
