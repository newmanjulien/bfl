<script lang="ts">
	import { useDashboardHeaderUiController } from '$lib/dashboard/shell/dashboard-header-ui';
	import { SvelteSet } from 'svelte/reactivity';
	import AllActivityTable from './AllActivityTable.svelte';
	import {
		getLikelyOutOfDateHeaderUiScope,
		LIKELY_OUT_OF_DATE_HEADER_SCOPE_ID
	} from './likely-out-of-date-header';
	import { getStaleLikelyOutOfDateSelectionRowIds } from './likely-out-of-date-selection';
	import type { AllActivityTableRow } from './projection';

	type Props = {
		rows: readonly AllActivityTableRow[];
	};

	let { rows }: Props = $props();
	let selectedRowIds = new SvelteSet<string>();
	const headerUiController = useDashboardHeaderUiController();
	const selection = {
		headerLabel: 'Select' as const,
		selectedRowIds,
		onToggleRow: toggleSelectedRow
	};

	$effect(() => {
		const staleRowIds = getStaleLikelyOutOfDateSelectionRowIds(selectedRowIds, rows);

		for (const rowId of staleRowIds) {
			selectedRowIds.delete(rowId);
		}
	});

	$effect(() => {
		const scope = getLikelyOutOfDateHeaderUiScope(selectedRowIds.size);

		if (scope) {
			headerUiController.setScope(LIKELY_OUT_OF_DATE_HEADER_SCOPE_ID, scope);
		} else {
			headerUiController.clearScope(LIKELY_OUT_OF_DATE_HEADER_SCOPE_ID);
		}

		return () => {
			headerUiController.clearScope(LIKELY_OUT_OF_DATE_HEADER_SCOPE_ID);
		};
	});

	function toggleSelectedRow(rowId: string, checked: boolean) {
		if (checked) {
			selectedRowIds.add(rowId);
		} else {
			selectedRowIds.delete(rowId);
		}
	}
</script>

<AllActivityTable {rows} {selection} />

{#if rows.length > 0}
	<div
		data-likely-out-of-date-info-bar
		class="mt-3 rounded-sm border border-zinc-100 bg-zinc-50/35 px-3 py-2"
	>
		<p class="text-xs leading-relaxed tracking-wide text-zinc-500">
			Use this view to find stale deals, then select the ones you want to ask for an update.
		</p>
	</div>
{/if}
