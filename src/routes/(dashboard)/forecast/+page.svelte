<script lang="ts">
	import DashboardFeedLayout from '$lib/dashboard/layout/DashboardFeedLayout.svelte';
	import CanvasHero from '$lib/ui/custom/CanvasHero.svelte';
	import ForecastQuadrant from './ForecastQuadrant.svelte';

	let { data } = $props();
</script>

{#snippet header()}
	<CanvasHero hero={data.hero} />
{/snippet}

<DashboardFeedLayout {header}>
	<section class="space-y-3">
		<ForecastQuadrant chart={data.chart} />
	</section>
</DashboardFeedLayout>
