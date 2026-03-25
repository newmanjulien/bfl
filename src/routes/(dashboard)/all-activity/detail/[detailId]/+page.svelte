<script lang="ts">
	import DashboardDetailPage from '$lib/dashboard/layout/DashboardDetailPage.svelte';
	import FileUploadField from '$lib/ui/skeleton/FileUploadField.svelte';
	import OrgChartSection from '$lib/ui/custom/OrgChartSection.svelte';
	import TimelineSection from '$lib/ui/custom/TimelineSection.svelte';

	let { data } = $props();

	const tabs = [
		{ id: 'activity', label: 'Activity' },
		{ id: 'org-chart', label: 'Org chart' },
		{ id: 'update', label: 'Update' }
	] as const;

	const initialTabId = tabs[0].id;
</script>

{#snippet content(activeTabId: string)}
	{#if activeTabId === 'activity'}
		<TimelineSection items={data.activityItems} />
	{:else if activeTabId === 'org-chart'}
		<OrgChartSection root={data.orgChartRoot} />
	{:else}
		<FileUploadField data={data.update} />
	{/if}
{/snippet}

<DashboardDetailPage hero={data.hero} rightRailData={data.rightRail} {tabs} {initialTabId} {content} />
