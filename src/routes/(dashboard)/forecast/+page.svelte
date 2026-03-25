<script lang="ts">
	import { getDashboardLayoutMaxWidth } from '$lib/dashboard/layout/tokens';
	import CanvasHero from '$lib/ui/custom/CanvasHero.svelte';
	import ForecastQuadrant from './ForecastQuadrant.svelte';

	let { data } = $props();
	const maxWidth = getDashboardLayoutMaxWidth('normal');
</script>

<div class="relative mx-auto w-full" style={`max-width: ${maxWidth};`}>
	<div class="px-4 pt-8 pb-6 sm:px-6 lg:px-8">
		<CanvasHero hero={data.hero} />
		<section class="space-y-3">
			<ForecastQuadrant chart={data.chart} />
		</section>
	</div>
</div>
