<script lang="ts">
	import { formatIsoDate } from '$lib/format/date-time';
	import { Rss } from 'lucide-svelte';
	import LinkedInGlyph from './LinkedInGlyph.svelte';
	import type { MyDealsNewsItem } from './projection';

	type Props = {
		items: readonly MyDealsNewsItem[];
	};

	let { items }: Props = $props();
</script>

{#if items.length === 0}
	<div class="rounded-md border border-dashed border-zinc-200 px-4 py-5 text-xs tracking-wide text-zinc-500">
		No news yet.
	</div>
{:else}
	<ol class="space-y-2.5 pt-1">
		{#each items as item (item.id)}
			<li>
				<div class="block rounded-md border border-zinc-100 px-3 py-3 transition-colors hover:bg-zinc-50">
					<div class="flex items-start justify-between gap-3">
						<div class="flex min-w-0 items-start gap-1.5">
							{#if item.source === 'linkedin'}
								<LinkedInGlyph class="mt-0.5 size-3 shrink-0 fill-current text-zinc-500" />
							{:else}
								<Rss class="mt-0.5 size-3 shrink-0 text-zinc-500" />
							{/if}
							<h2 class="min-w-0 text-xs leading-snug tracking-wide text-zinc-800">{item.title}</h2>
						</div>
						<p class="shrink-0 text-[11px] tracking-wide text-zinc-400">
							{formatIsoDate(item.publishedOnIso)}
						</p>
					</div>

					<div aria-hidden="true" class="mt-3.5 space-y-1.5">
						<div class="h-2 rounded-[3px] bg-zinc-200/90"></div>
						<div class="h-2 rounded-[3px] bg-zinc-200/90"></div>
						<div class="h-2 w-1/3 rounded-[3px] bg-zinc-200/90"></div>
					</div>
				</div>
			</li>
		{/each}
	</ol>
{/if}
