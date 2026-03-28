<script lang="ts">
	import type { DealSummaryRow } from '$lib/dashboard/view-models/deal';
	import ActivityLevelLabel from '$lib/dashboard/ui/activity-level/ActivityLevelLabel.svelte';
	import DashboardTableShell from '$lib/dashboard/ui/shared/DashboardTableShell.svelte';

	type Props = {
		rows: readonly DealSummaryRow[];
	};

	let { rows }: Props = $props();

	const headers = ['Deal', 'Probability', 'Activity level', 'Stage'] as const;
	const columnClass =
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

<div class="pt-1">
	<DashboardTableShell
		{headers}
		{columnClass}
		{minWidthClass}
		ariaLabel="Deal summary table"
		rowsLength={rows.length}
	>
		{#snippet body()}
			<div class="divide-y divide-zinc-100">
				{#each rows as row (row.key)}
					<div data-table-row class={columnClass}>
						{@render rowCells(row)}
					</div>
				{/each}
			</div>
		{/snippet}
	</DashboardTableShell>
</div>
