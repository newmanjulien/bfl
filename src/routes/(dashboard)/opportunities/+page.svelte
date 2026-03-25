<script lang="ts">
	import { Lightbulb, TriangleAlert } from 'lucide-svelte';
	import { getDashboardLayoutMaxWidth } from '$lib/dashboard/layout/tokens';
	import CanvasHero from '$lib/ui/custom/CanvasHero.svelte';
	import SectionTabPanel from '$lib/ui/custom/SectionTabPanel.svelte';
	import SectionTabs from '$lib/ui/custom/SectionTabs.svelte';
	import OpportunityTileList from './OpportunityTileList.svelte';

	let { data } = $props();

	const tabs = [
		{ id: 'opportunities-tiles', label: 'Opportunities' },
		{ id: 'risks-tiles', label: 'Risks' }
	] as const;

	const maxWidth = getDashboardLayoutMaxWidth('normal');
</script>

<div class="relative mx-auto w-full" style={`max-width: ${maxWidth};`}>
		<div class="px-4 pt-8 pb-6 sm:px-6 lg:px-8">
			<CanvasHero hero={data.hero} />
				<SectionTabs {tabs}>
					<SectionTabPanel tabId="opportunities-tiles">
						<OpportunityTileList tiles={data.opportunityTiles} icon={Lightbulb} />
					</SectionTabPanel>
					<SectionTabPanel tabId="risks-tiles">
						<OpportunityTileList tiles={data.riskTiles} icon={TriangleAlert} />
					</SectionTabPanel>
				</SectionTabs>
			</div>
	</div>
