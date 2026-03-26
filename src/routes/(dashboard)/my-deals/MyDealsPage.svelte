<script lang="ts">
	import type { MyDealsView } from '$lib/dashboard/my-deals-routes';
	import { getDashboardLayoutMaxWidth } from '$lib/dashboard/layout/tokens';
	import { useDashboardHeaderUiController } from '$lib/dashboard/shell/dashboard-header-ui';
	import CanvasHero from '$lib/ui/custom/CanvasHero.svelte';
	import SectionTabPanel from '$lib/ui/custom/SectionTabPanel.svelte';
	import SectionTabs from '$lib/ui/custom/SectionTabs.svelte';
	import type { CanvasHeroData } from '$lib/ui/custom/canvas-hero';
	import { getMyDealsHeaderUiScope, MY_DEALS_HEADER_SCOPE_ID } from './header-ui';
	import MyDealsLinkedInEmptyState from './MyDealsLinkedInEmptyState.svelte';
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
	const headerUiController = useDashboardHeaderUiController();
	const maxWidth = $derived(
		getDashboardLayoutMaxWidth(data.selectedView === 'news' ? 'normal' : 'wide')
	);
	const tabs = [
		{ id: 'news', label: 'News' },
		{ id: 'linkedin', label: 'LinkedIn' }
	] as const;

	$effect(() => {
		const scope = getMyDealsHeaderUiScope(data.selectedView);

		if (scope) {
			headerUiController.setScope(MY_DEALS_HEADER_SCOPE_ID, scope);
		} else {
			headerUiController.clearScope(MY_DEALS_HEADER_SCOPE_ID);
		}

		return () => {
			headerUiController.clearScope(MY_DEALS_HEADER_SCOPE_ID);
		};
	});
</script>

<div class="relative mx-auto w-full" style={`max-width: ${maxWidth};`}>
	<div class="px-4 pt-8 pb-6 sm:px-6 lg:px-8">
		{#if data.selectedView === 'news'}
			<CanvasHero hero={data.hero} />
			<SectionTabs {tabs}>
				<SectionTabPanel tabId="news">
					<MyDealsNewsList items={data.newsItems} />
				</SectionTabPanel>
				<SectionTabPanel tabId="linkedin">
					<MyDealsLinkedInEmptyState />
				</SectionTabPanel>
			</SectionTabs>
		{:else}
			<MyDealsTable rows={data.rows} />
			{#if data.rows.length > 0}
				<div
					data-my-deals-deals-info-bar
					class="mt-3 rounded-sm border border-zinc-100 bg-zinc-50/35 px-3 py-2"
				>
					<p class="text-xs leading-relaxed tracking-wide text-zinc-500">
						We automatially reserve deals for you in Epic and deals which are reserved have a checkmark
					</p>
				</div>
			{/if}
		{/if}
	</div>
</div>
