<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatIsoDateTimeRelative } from '$lib/format/date-time';
	import ActivityLevelLabel from '$lib/ui/custom/ActivityLevelLabel.svelte';
	import PersonInline from '$lib/ui/custom/PersonInline.svelte';
	import ResponsiveTableShell from '$lib/ui/custom/ResponsiveTableShell.svelte';
	import { cn } from '$lib/support/cn';
	import type { AllActivityTableRow } from './projection';

	type Props = {
		rows: readonly AllActivityTableRow[];
	};

	let { rows }: Props = $props();

	const headers = ['Deal', 'Probability', 'Activity level', 'Owner', 'Stage', 'Last activity'] as const;
	const columnsClass =
		'grid-cols-[minmax(9rem,1.2fr)_minmax(9rem,1fr)_minmax(8.5rem,0.95fr)_minmax(9.5rem,1fr)_minmax(8rem,0.85fr)_minmax(8rem,0.85fr)] md:grid-cols-6';
	const minWidthClass = 'min-w-[58rem] md:min-w-full';
</script>

{#snippet rowCells(row: AllActivityTableRow, isLinked: boolean)}
	<span
		data-table-cell
		class={`font-medium text-zinc-600${
			isLinked ? ' transition-colors group-hover:text-zinc-900' : ''
		}`}
	>
		{row.deal}
	</span>
	<span data-table-cell class="whitespace-nowrap text-zinc-900">
		{row.probability}% likely to close
	</span>
	<span data-table-cell class="whitespace-nowrap">
		<ActivityLevelLabel activityLevel={row.activityLevel} />
	</span>
	<span data-table-cell class="whitespace-nowrap text-zinc-600">
		{#if row.owner}
			<PersonInline person={row.owner} />
		{:else}
			Unassigned
		{/if}
	</span>
	<span data-table-cell class="whitespace-nowrap text-zinc-600">
		{row.stage}
	</span>
	<span data-table-cell class="whitespace-nowrap text-zinc-500">
		{formatIsoDateTimeRelative(row.lastActivityAtIso)}
	</span>
{/snippet}

<ResponsiveTableShell
	headers={headers}
	{columnsClass}
	{minWidthClass}
	interactiveRows={true}
	isEmpty={rows.length === 0}
	ariaLabel="All activity deals table"
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
