<script lang="ts">
	import type { SinceLastMeetingDealRowPageData } from '$lib/dashboard/page-models/sinceLastMeeting';
	import { resolveDashboardHref } from '$lib/dashboard/routing/href';
	import ActivityLevelLabel from '$lib/dashboard/ui/activity-level/ActivityLevelLabel.svelte';
	import DashboardTableShell from '$lib/dashboard/ui/shared/DashboardTableShell.svelte';
	import { cn } from '$lib/support/cn';

	type Props = {
		rows: readonly SinceLastMeetingDealRowPageData[];
	};

	let { rows }: Props = $props();

	const headers = ['Deal', 'Probability', 'Activity level', 'Stage'] as const;
	const columnClass =
		'grid-cols-[minmax(9rem,1.15fr)_minmax(9rem,1fr)_minmax(8.5rem,0.95fr)_minmax(8rem,0.9fr)] md:grid-cols-4';
	const minWidthClass = 'min-w-[40rem] md:min-w-full';
</script>

{#snippet rowCells(row: SinceLastMeetingDealRowPageData, isLinked: boolean)}
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
		interactiveRows={rows.some((row) => row.navigation.kind === 'internal')}
	>
		{#snippet body()}
			<div class="divide-y divide-zinc-100">
				{#each rows as row (row.id)}
					{#if row.navigation.kind === 'internal'}
						<a
							href={resolveDashboardHref(row.navigation.route)}
							data-table-row
							data-table-row-interactive="true"
							class={cn(columnClass, 'group no-underline')}
						>
							{@render rowCells(row, true)}
						</a>
					{:else}
						<div data-table-row data-table-row-interactive="false" class={columnClass}>
							{@render rowCells(row, false)}
						</div>
					{/if}
				{/each}
			</div>
		{/snippet}
	</DashboardTableShell>
</div>
