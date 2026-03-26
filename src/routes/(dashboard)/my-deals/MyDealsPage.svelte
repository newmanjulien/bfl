<script lang="ts">
	import type { MyDealsView } from '$lib/dashboard/my-deals-routes';
	import { getDashboardLayoutMaxWidth } from '$lib/dashboard/layout/tokens';
	import CanvasHero from '$lib/ui/custom/CanvasHero.svelte';
	import SectionTabPanel from '$lib/ui/custom/SectionTabPanel.svelte';
	import SectionTabs from '$lib/ui/custom/SectionTabs.svelte';
	import type { CanvasHeroData } from '$lib/ui/custom/canvas-hero';
	import MyDealsNewsList from './MyDealsNewsList.svelte';
	import MyDealsTable from './MyDealsTable.svelte';
	import type { MyDealsNewsItem, MyDealsTableRow } from './projection';

	type Props = {
		data: {
			selectedView: MyDealsView;
			hero?: CanvasHeroData;
			rows: readonly MyDealsTableRow[];
			newsItems: readonly MyDealsNewsItem[];
		};
	};

	let { data }: Props = $props();
	const maxWidth = $derived(
		getDashboardLayoutMaxWidth(data.selectedView === 'news' ? 'normal' : 'wide')
	);
	const tabs = [{ id: 'news', label: "This week's news" }] as const;
</script>

<div class="relative mx-auto w-full" style={`max-width: ${maxWidth};`}>
	<div class="px-4 pt-8 pb-6 sm:px-6 lg:px-8">
		{#if data.selectedView === 'news'}
			<CanvasHero hero={data.hero} />
			<SectionTabs {tabs}>
				<SectionTabPanel tabId="news">
					<MyDealsNewsList items={data.newsItems} />
				</SectionTabPanel>
			</SectionTabs>
		{:else}
			<MyDealsTable rows={data.rows} />
		{/if}
	</div>
</div>
