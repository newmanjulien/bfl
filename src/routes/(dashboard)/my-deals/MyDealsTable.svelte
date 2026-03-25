<script lang="ts">
	import { resolve } from '$app/paths';
	import NewsSourceInline from '$lib/ui/custom/NewsSourceInline.svelte';
	import PersonInline from '$lib/ui/custom/PersonInline.svelte';
	import { cn } from '$lib/support/cn';
	import type { MyDealsTableRow } from './projection';

	type Props = {
		rows: readonly MyDealsTableRow[];
	};

	let { rows }: Props = $props();

	const headers = ['Deal', 'Latest news', 'Last activity', 'Owner'] as const;
	const columnClass =
		'justify-start grid-cols-[minmax(8.5rem,10rem)_minmax(13rem,16rem)_minmax(13rem,16rem)_minmax(8rem,10rem)] md:grid-cols-[minmax(11rem,14rem)_minmax(18rem,24rem)_minmax(18rem,24rem)_minmax(10rem,13rem)]';
	const minWidthClass = 'min-w-[42.5rem] md:min-w-full';
</script>

{#snippet rowCells(row: MyDealsTableRow, isLinked: boolean)}
	<span
		data-table-cell
		class={`overflow-hidden font-medium text-zinc-600${
			isLinked ? ' transition-colors group-hover:text-zinc-900' : ''
		}`}
	>
		<span class="block truncate">{row.deal}</span>
	</span>
	<span data-table-cell class="overflow-hidden text-zinc-600">
		<NewsSourceInline source={row.latestNewsSource} text={row.latestNews} />
	</span>
	<span
		data-table-cell
		class="overflow-hidden text-zinc-600"
		title={row.lastActivityDescription}
	>
		<span class="block truncate">{row.lastActivityDescription}</span>
	</span>
	<span data-table-cell class="overflow-hidden text-zinc-600">
		{#if row.owner}
			<PersonInline
				person={row.owner}
				class="flex min-w-0 w-full"
				truncate={true}
			/>
		{:else}
			<span class="block truncate">Unassigned</span>
		{/if}
	</span>
{/snippet}

<div class="pt-1">
	<div
		class="dashboard-table-shell rounded-sm border border-zinc-100 bg-white"
		data-interactive-rows="true"
	>
		<div
			data-table-scroll
			class="overflow-x-auto overflow-y-hidden overscroll-x-contain"
			role="region"
			aria-label="My deals table"
		>
			<div class={cn('w-max min-w-full md:w-full', minWidthClass)}>
				<div class={cn('grid border-b border-zinc-100 bg-zinc-50/80', columnClass)}>
					{#each headers as header (header)}
						<span data-table-header-cell class="text-left font-normal text-zinc-500">
							{header}
						</span>
					{/each}
				</div>

				{#if rows.length === 0}
					<div data-table-empty class="text-zinc-500">No rows available.</div>
				{:else}
					<div class="divide-y divide-zinc-100">
						{#each rows as row (row.id)}
							{#if row.navigation.kind === 'detail'}
								<a
									href={resolve(row.navigation.href)}
									data-table-row
									class={cn(columnClass, 'group no-underline')}
								>
									{@render rowCells(row, true)}
								</a>
							{:else}
								<div data-table-row class={columnClass}>
									{@render rowCells(row, false)}
								</div>
							{/if}
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
