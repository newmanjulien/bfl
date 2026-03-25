<script lang="ts">
	import { Lightbulb, List, Rss, TriangleAlert } from 'lucide-svelte';
	import type { CanvasHeroData, CanvasHeroIconKind } from './canvas-hero';
	import { formatDealNumber } from '$lib/format/deals';
	import { cn } from '$lib/support/cn';

	type Props = {
		hero?: CanvasHeroData;
	};

	let { hero }: Props = $props();

	const ICONS: Record<CanvasHeroIconKind, typeof List> = {
		list: List,
		opportunity: Lightbulb,
		risk: TriangleAlert,
		rss: Rss
	};
</script>

{#if hero}
	<header class="mb-7 border-b border-zinc-100 pb-4">
		{#if hero.dealNumber || hero.iconKind}
			<div class="space-y-2">
				{#if hero.iconKind}
					{@const Icon = ICONS[hero.iconKind]}
					<div class="mb-4 inline-flex size-11 items-center justify-center rounded-md bg-zinc-100 text-zinc-500">
						<Icon class="size-5.5 text-current" />
					</div>
				{/if}
				{#if hero.dealNumber}
					<p class="text-xs tracking-wide text-zinc-400">{formatDealNumber(hero.dealNumber)}</p>
				{/if}
			</div>
		{/if}

		{#if hero.title}
			<h1 class={cn('text-sm font-medium tracking-wide text-zinc-900', (hero.dealNumber || hero.iconKind) && 'mt-2')}>
				{hero.title}
			</h1>
		{/if}

		{#if hero.description}
			<p
				class={cn(
					'max-w-xl text-xs leading-relaxed tracking-wide text-zinc-500',
					hero.title && 'mt-1',
					!hero.title && (hero.dealNumber || hero.iconKind) && 'mt-2'
				)}
			>
				{hero.description}
			</p>
		{/if}
	</header>
{/if}
