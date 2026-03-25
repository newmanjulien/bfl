<script lang="ts">
	import { Rss } from 'lucide-svelte';
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
					<div class="flex items-center gap-1.5">
						{#if item.source === 'linkedin'}
							<svg viewBox="0 0 24 24" aria-hidden="true" class="size-3 shrink-0 fill-current text-zinc-500">
								<path d="M4.98 3.5a2.49 2.49 0 1 1 0 4.98 2.49 2.49 0 0 1 0-4.98ZM3 8.98h3.96V21H3zm6.48 0h3.8v1.64h.05c.53-1 1.82-2.05 3.75-2.05 4.01 0 4.75 2.64 4.75 6.08V21h-3.96v-5.66c0-1.35-.02-3.09-1.88-3.09-1.88 0-2.17 1.47-2.17 2.99V21H9.48z" />
							</svg>
						{:else}
							<Rss class="size-3 text-zinc-500" />
						{/if}
						<h2 class="text-xs leading-snug tracking-wide text-zinc-800">{item.title}</h2>
					</div>

					<p class="sr-only">{item.description}</p>

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
