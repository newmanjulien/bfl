<script lang="ts">
	import { resolve } from '$app/paths';
	import { resolveDashboardRoute } from '$lib/dashboard/routing';
	import type { MyDealsListPageData } from '$lib/dashboard/page-models/myDeals';
	import type { BrokerId } from '$lib/types/ids';
	import { Check } from 'lucide-svelte';
	import NewsSourceInline from '$lib/dashboard/ui/detail/NewsSourceInline.svelte';
	import PersonInline from '$lib/dashboard/ui/people/PersonInline.svelte';
	import DashboardTableShell from '$lib/dashboard/ui/shared/DashboardTableShell.svelte';
	import { cn } from '$lib/support/cn';
	type MyDealsTableRow = MyDealsListPageData['rows'][number];

	type Props = {
		rows: readonly MyDealsTableRow[];
		activeBrokerId: BrokerId;
	};

	let { rows, activeBrokerId }: Props = $props();

	const headers = ['Deal', 'Latest news', 'Last activity', 'Owner', 'Reserved in Epic'] as const;
	const columnClass =
		'justify-start grid-cols-[minmax(10rem,1.35fr)_minmax(13rem,1.2fr)_minmax(13rem,1.2fr)_minmax(8rem,0.9fr)_minmax(5.5rem,0.5fr)] md:grid-cols-[minmax(10rem,1.4fr)_minmax(18rem,1.35fr)_minmax(18rem,1.35fr)_minmax(9rem,0.95fr)_minmax(6rem,0.45fr)]';
	const minWidthClass = 'min-w-[52rem] md:min-w-full';
</script>

	{#snippet rowCells(row: MyDealsTableRow, isLinked: boolean)}
		{@const showReservedInEpic =
			row.owner?.id === activeBrokerId && row.isReservedInEpic}
		<span
			data-table-cell
			class={`overflow-hidden font-medium text-zinc-600${
			isLinked ? ' transition-colors group-hover:text-zinc-900' : ''
		}`}
	>
		<span class="block truncate">{row.deal}</span>
	</span>
	<span data-table-cell class="overflow-hidden text-zinc-600">
		{#if row.latestNewsSource}
			<NewsSourceInline source={row.latestNewsSource} text={row.latestNews} />
		{:else}
			<span class="block truncate" title={row.latestNews}>{row.latestNews}</span>
		{/if}
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
			<PersonInline person={row.owner} class="flex min-w-0 w-full" truncate={true} />
		{:else}
			<span class="block truncate">Unassigned</span>
		{/if}
	</span>
	<span data-table-cell class="flex items-center justify-center text-zinc-600">
		{#if showReservedInEpic}
			<Check aria-hidden="true" class="size-3.5" />
			<span class="sr-only">Reserved in Epic: Yes</span>
		{:else}
			<span class="sr-only">Reserved in Epic: No</span>
		{/if}
	</span>
{/snippet}

<div class="pt-1">
	<DashboardTableShell
		{headers}
		{columnClass}
		{minWidthClass}
		ariaLabel="My deals table"
		rowsLength={rows.length}
	>
		{#snippet body()}
			<div class="divide-y divide-zinc-100">
				{#each rows as row (row.id)}
					{#if row.navigation.kind === 'internal'}
						<a
							href={resolve(resolveDashboardRoute(row.navigation.route))}
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
		{/snippet}
	</DashboardTableShell>
</div>
