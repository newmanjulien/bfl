<script lang="ts">
	import DashboardDetailPage from '$lib/dashboard/layout/DashboardDetailPage.svelte';
	import FileUploadField from '$lib/ui/skeleton/FileUploadField.svelte';
	import TimelineSection from '$lib/ui/custom/TimelineSection.svelte';
	import MyDealsNewsList from '../../MyDealsNewsList.svelte';

	let { data } = $props();

	const tabs = [
		{ id: 'news', label: 'News' },
		{ id: 'activity', label: 'Activity' },
		{ id: 'update', label: 'Update' }
	] as const;

	const initialTabId = tabs[0].id;
</script>

{#snippet content(activeTabId: string)}
	{#if activeTabId === 'news'}
		<MyDealsNewsList items={data.newsItems} />
	{:else if activeTabId === 'activity'}
		<TimelineSection items={data.activityItems} />
	{:else}
		<FileUploadField data={data.update} />
	{/if}
{/snippet}

<DashboardDetailPage hero={data.hero} rightRailData={data.rightRail} {tabs} {initialTabId} {content} />
