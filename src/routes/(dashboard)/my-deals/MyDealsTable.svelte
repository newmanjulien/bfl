<script lang="ts">
	import { resolve } from '$app/paths';
	import NewsSourceInline from '$lib/ui/custom/NewsSourceInline.svelte';
	import PersonInline from '$lib/ui/custom/PersonInline.svelte';
	import ResponsiveTableShell from '$lib/ui/custom/ResponsiveTableShell.svelte';
	import { cn } from '$lib/support/cn';
	import type { MyDealsTableRow } from './projection';

	type Props = {
		rows: readonly MyDealsTableRow[];
	};

	let { rows }: Props = $props();

	const headers = ['Deal', 'Latest news', 'Last activity', 'Owner'] as const;
	const columnsClass =
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
				nameClass="min-w-0 truncate"
			/>
		{:else}
			<span class="block truncate">Unassigned</span>
		{/if}
	</span>
{/snippet}

<ResponsiveTableShell
	headers={headers}
	{columnsClass}
	{minWidthClass}
	interactiveRows={true}
	isEmpty={rows.length === 0}
	ariaLabel="My deals table"
	class="pt-1"
>
	{#snippet body()}
		{#each rows as row (row.id)}
			{#if row.navigation.kind === 'detail'}
				<a
					href={resolve(row.navigation.href)}
					data-table-row
					class={cn(columnsClass, 'group no-underline')}
				>
					{@render rowCells(row, true)}
				</a>
			{:else}
				<div data-table-row class={columnsClass}>
					{@render rowCells(row, false)}
				</div>
			{/if}
		{/each}
	{/snippet}
</ResponsiveTableShell>
