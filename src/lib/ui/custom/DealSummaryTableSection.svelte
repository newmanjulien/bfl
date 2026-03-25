<script lang="ts">
	import type { DealSummaryRow } from '$lib/presentation/deal-summary';
	import ActivityLevelLabel from './ActivityLevelLabel.svelte';

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
	<div class="dashboard-table-shell rounded-sm border border-zinc-100 bg-white">
		<div
			data-table-scroll
			class="overflow-x-auto overflow-y-hidden overscroll-x-contain"
			role="region"
			aria-label="Deal summary table"
		>
			<div class={`w-max min-w-full md:w-full ${minWidthClass}`}>
				<div class={`grid border-b border-zinc-100 bg-zinc-50/80 ${columnClass}`}>
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
							<div data-table-row class={columnClass}>
								{@render rowCells(row)}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
