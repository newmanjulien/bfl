<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { DetailRightRailData } from '$lib/dashboard/detail-rail-model';
	import type { CanvasHeroData } from '$lib/ui/custom/canvas-hero';
	import CanvasHero from '$lib/ui/custom/CanvasHero.svelte';
	import DetailRightRail from '$lib/ui/custom/DetailRightRail.svelte';
	import SectionTabs from '$lib/ui/custom/SectionTabs.svelte';
	import DashboardDetailLayout from './DashboardDetailLayout.svelte';
	import type { DashboardDetailRailWidth, DashboardLayoutWidth } from './tokens';

	type DashboardDetailTab = {
		id: string;
		label: string;
	};

	type Props = {
		hero: CanvasHeroData;
		rightRailData: DetailRightRailData;
		tabs: readonly DashboardDetailTab[];
		initialTabId?: string;
		width?: DashboardLayoutWidth;
		railWidth?: DashboardDetailRailWidth;
		class?: string;
		contentClass?: string;
		content?: Snippet<[activeTabId: string]>;
	};

	let {
		hero,
		rightRailData,
		tabs,
		initialTabId,
		width = 'normal',
		railWidth = 'standard',
		class: className = '',
		contentClass = '',
		content
	}: Props = $props();

	const firstTabId = $derived(tabs[0]?.id ?? '');
	const preferredTabId = $derived(
		tabs.some((tab) => tab.id === initialTabId) ? (initialTabId ?? firstTabId) : firstTabId
	);

	let activeTabId = $state('');

	$effect(() => {
		if (!tabs.some((tab) => tab.id === activeTabId)) {
			activeTabId = preferredTabId;
		}
	});
</script>

{#snippet header()}
	<CanvasHero hero={hero} />
{/snippet}

{#snippet rightRail()}
	<DetailRightRail data={rightRailData} />
{/snippet}

<DashboardDetailLayout {header} {rightRail} {width} {railWidth} class={className} {contentClass}>
	<section class="flex flex-col gap-4">
		<div class="flex items-center gap-6 border-b border-zinc-100">
			<SectionTabs {tabs} bind:value={activeTabId} />
		</div>

		{#if content}
			{@render content(activeTabId)}
		{/if}
	</section>
</DashboardDetailLayout>
