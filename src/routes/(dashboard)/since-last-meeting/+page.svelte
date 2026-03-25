<script lang="ts">
	import DashboardFeedLayout from '$lib/dashboard/layout/DashboardFeedLayout.svelte';
	import CanvasHero from '$lib/ui/custom/CanvasHero.svelte';
	import DealSummaryTableSection from '$lib/ui/custom/DealSummaryTableSection.svelte';
	import SectionTabs from '$lib/ui/custom/SectionTabs.svelte';
	import FileUploadField from '$lib/ui/skeleton/FileUploadField.svelte';
	import TimelineSection from '$lib/ui/custom/TimelineSection.svelte';

	let { data } = $props();

	const tabs = [
		{ id: 'timeline', label: 'Timeline' },
		{ id: 'deals', label: 'Deals' },
		{ id: 'update', label: 'Update' }
	] as const;

	let activeTabId = $state<(typeof tabs)[number]['id']>(tabs[0].id);
</script>

{#snippet header()}
	<CanvasHero hero={data.hero} />
{/snippet}

<DashboardFeedLayout {header}>
	<section class="flex flex-col gap-4">
		<div class="flex items-center gap-6 border-b border-zinc-100">
			<SectionTabs {tabs} bind:value={activeTabId} />
		</div>

		{#if activeTabId === 'timeline'}
			<TimelineSection items={data.timelineItems} />
		{:else if activeTabId === 'deals'}
			<DealSummaryTableSection rows={data.deals} />
		{:else}
			<FileUploadField data={data.update} />
		{/if}
	</section>
</DashboardFeedLayout>
