<script lang="ts">
	import { resolve } from '$app/paths';
	import { Building } from 'lucide-svelte';
	import { formatDealNumber } from '$lib/format/deals';
	import type { CanvasHeroIcon } from '$lib/ui/custom/canvas-hero';
	import ActivityLevelLabel from '$lib/ui/custom/ActivityLevelLabel.svelte';
	import type { OpportunityTile } from './projection';

	type Props = {
		tiles: readonly OpportunityTile[];
		icon: CanvasHeroIcon;
	};

	let { tiles, icon: Icon }: Props = $props();
</script>

<ol class="space-y-2.5 pt-1">
	{#each tiles as tile (tile.id)}
		{@const hasBottomMeta = Boolean(tile.dealLabel || tile.activityLevel)}
		<li>
			<a
				href={resolve(tile.href)}
				class="block rounded-md border border-zinc-100 px-3 py-3 transition-colors hover:bg-zinc-50"
			>
				<div class="flex items-start justify-between gap-3">
					<p class="text-[10px] tracking-wide text-zinc-500">
						{formatDealNumber(tile.dealNumber)}
					</p>
					{#if tile.avatars}
						{#if tile.avatars.length === 2}
							<div class="relative h-5 w-7 shrink-0">
								<span
									class="absolute left-[9px] top-0 inline-flex size-5 shrink-0 overflow-hidden rounded-full border border-white bg-zinc-50"
								>
									<img
										src={tile.avatars[1]}
										alt={`${tile.title} owner avatar 2`}
										class="h-full w-full object-cover"
									/>
								</span>
								<span
									class="absolute left-0 top-0 inline-flex size-5 shrink-0 overflow-hidden rounded-full border border-white bg-zinc-50"
								>
									<img
										src={tile.avatars[0]}
										alt={`${tile.title} owner avatar 1`}
										class="h-full w-full object-cover"
									/>
								</span>
							</div>
						{:else}
							<div class="flex items-center -space-x-1">
								{#each tile.avatars as avatar, index (`${avatar}:${index}`)}
									<span class="inline-flex size-5 shrink-0 overflow-hidden rounded-full border border-white bg-zinc-50">
										<img
											src={avatar}
											alt={`${tile.title} owner avatar ${index + 1}`}
											class="h-full w-full object-cover"
										/>
									</span>
								{/each}
							</div>
						{/if}
					{/if}
				</div>

				<div class="mt-2 flex items-center gap-1.5">
					<Icon class="size-3 text-zinc-500" />
					<h2 class="text-xs leading-snug tracking-wide text-zinc-800">{tile.title}</h2>
				</div>

				<div class="mt-3.5 space-y-1.5">
					<div class="h-2 rounded-[3px] bg-zinc-200/90"></div>
					<div class="h-2 rounded-[3px] bg-zinc-200/90"></div>
					<div class="h-2 w-1/3 rounded-[3px] bg-zinc-200/90"></div>
				</div>

				{#if hasBottomMeta}
					<div class="mt-4 flex flex-wrap items-center gap-1.5">
						{#if tile.dealLabel}
							<span class="inline-flex items-center gap-1 rounded-md border border-zinc-100 px-2 py-0.5 text-[11px] tracking-wide text-zinc-800">
								<Building aria-hidden="true" class="size-2.5 text-zinc-400" />
								{tile.dealLabel}
							</span>
						{/if}
						{#if tile.activityLevel}
							<ActivityLevelLabel activityLevel={tile.activityLevel} />
						{/if}
					</div>
				{/if}
			</a>
		</li>
	{/each}
</ol>
