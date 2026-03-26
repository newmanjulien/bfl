<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatIsoDateTimeRelative } from '$lib/format/date-time';
	import ActivityLevelLabel from '$lib/ui/custom/ActivityLevelLabel.svelte';
	import PersonInline from '$lib/ui/custom/PersonInline.svelte';
	import { cn } from '$lib/support/cn';
	import type { AllActivityTableRow } from './projection';

	type AllActivityTableSelection = {
		headerLabel: 'Select';
		selectedRowIds: ReadonlySet<string>;
		onToggleRow: (rowId: string, checked: boolean) => void;
	};

	type Props = {
		rows: readonly AllActivityTableRow[];
		selection?: AllActivityTableSelection;
	};

	let { rows, selection }: Props = $props();

	const headers = ['Deal', 'Probability', 'Activity level', 'Owner', 'Stage', 'Last activity'] as const;
	let columnClass = $derived(
		selection
			? 'grid-cols-[4rem_minmax(9rem,1.2fr)_minmax(9rem,1fr)_minmax(8.5rem,0.95fr)_minmax(9.5rem,1fr)_minmax(8rem,0.85fr)_minmax(8rem,0.85fr)] md:grid-cols-[4rem_repeat(6,minmax(0,1fr))]'
			: 'grid-cols-[minmax(9rem,1.2fr)_minmax(9rem,1fr)_minmax(8.5rem,0.95fr)_minmax(9.5rem,1fr)_minmax(8rem,0.85fr)_minmax(8rem,0.85fr)] md:grid-cols-6'
	);
	let minWidthClass = $derived(selection ? 'min-w-[62rem] md:min-w-full' : 'min-w-[58rem] md:min-w-full');
</script>

{#snippet rowCells(row: AllActivityTableRow, isLinked: boolean)}
	{#if selection}
		<label
			data-table-cell
			data-table-select-cell
			class="cursor-pointer items-center justify-center"
		>
			<input
				data-selection-checkbox
				type="checkbox"
				aria-label={`Select ${row.deal}`}
				class="h-3.5 w-3.5 rounded-[3px] border-zinc-300 accent-zinc-900"
				checked={selection.selectedRowIds.has(row.id)}
				onchange={(event) =>
					selection.onToggleRow(row.id, (event.currentTarget as HTMLInputElement).checked)}
			/>
		</label>
	{/if}
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
		{#if row.lastActivity.kind === 'relative'}
			{formatIsoDateTimeRelative(row.lastActivity.atIso)}
		{:else}
			{row.lastActivity.label}
		{/if}
	</span>
{/snippet}

<div
	class="dashboard-table-shell rounded-sm border border-zinc-100 bg-white"
	data-interactive-rows={selection ? 'false' : 'true'}
>
	<div
		data-table-scroll
		class="overflow-x-auto overflow-y-hidden overscroll-x-contain"
		role="region"
		aria-label="All activity deals table"
	>
		<div class={cn('w-max min-w-full md:w-full', minWidthClass)}>
			<div
				data-table-header-row
				class={cn('grid border-b border-zinc-100 bg-zinc-50/80', columnClass)}
			>
				{#if selection}
					<span
						data-table-header-cell
						data-table-select-header
						class="whitespace-nowrap text-left font-normal text-zinc-500"
					>
						{selection.headerLabel}
					</span>
				{/if}
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
						{#if !selection && row.navigation.kind === 'detail'}
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
