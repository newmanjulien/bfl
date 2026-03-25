<script lang="ts">
	import DashboardFeedLayout from '$lib/dashboard/layout/DashboardFeedLayout.svelte';
	import CanvasHero from '$lib/ui/custom/CanvasHero.svelte';
	import SectionTabs from '$lib/ui/custom/SectionTabs.svelte';
	import OpportunityTileList from './OpportunityTileList.svelte';

	let { data } = $props();

	const tabs = [
		{ id: 'opportunities-tiles', label: 'Opportunities' },
		{ id: 'risks-tiles', label: 'Risks' }
	] as const;

	let activeTabId = $state<(typeof tabs)[number]['id']>(tabs[0].id);
</script>

{#snippet header()}
	<CanvasHero hero={data.hero} />
{/snippet}

<DashboardFeedLayout {header}>
	<section class="space-y-4">
		<div class="flex items-center gap-6 border-b border-zinc-100">
			<SectionTabs {tabs} bind:value={activeTabId} />
		</div>

		{#if activeTabId === 'opportunities-tiles'}
			<OpportunityTileList tiles={data.opportunityTiles} />
		{:else}
			<OpportunityTileList tiles={data.riskTiles} />
		{/if}
	</section>
</DashboardFeedLayout>
