<script lang="ts">
	import type { DealSummaryRow } from '$lib/presentation/deal-summary';
	import ActivityLevelLabel from './ActivityLevelLabel.svelte';
	import ResponsiveTableShell from './ResponsiveTableShell.svelte';

	type Props = {
		rows: readonly DealSummaryRow[];
	};

	let { rows }: Props = $props();

	const headers = ['Deal', 'Probability', 'Activity level', 'Stage'] as const;
	const columnsClass =
		'grid-cols-[minmax(9rem,1.15fr)_minmax(9rem,1fr)_minmax(8.5rem,0.95fr)_minmax(8rem,0.9fr)] md:grid-cols-4';
	const minWidthClass = 'min-w-[40rem] md:min-w-full';
</script>

{#snippet rowCells(row: DealSummaryRow)}
	<span data-table-cell class="font-medium text-zinc-600">
		{row.deal}
	</span>
	<span data-table-cell class="whitespace-nowrap text-zinc-900">
		{row.probability}% likely to close
	</span>
	<span data-table-cell class="whitespace-nowrap">
		<ActivityLevelLabel activityLevel={row.activityLevel} />
	</span>
	<span data-table-cell class="whitespace-nowrap text-zinc-600">
		{row.stage}
	</span>
{/snippet}

<ResponsiveTableShell
	headers={headers}
	{columnsClass}
	{minWidthClass}
	isEmpty={rows.length === 0}
	ariaLabel="Deal summary table"
	class="pt-1"
>
	{#snippet body()}
		{#each rows as row (row.id)}
			<div data-table-row class={columnsClass}>
				{@render rowCells(row)}
			</div>
		{/each}
	{/snippet}
</ResponsiveTableShell>
