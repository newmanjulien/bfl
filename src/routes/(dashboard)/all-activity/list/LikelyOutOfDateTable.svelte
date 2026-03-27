<script lang="ts">
	import type { AllActivityListQueryResult } from '../../../../convex/allActivity';
	import { SvelteSet } from 'svelte/reactivity';
	import DashboardHeaderScope from '$lib/dashboard/shell/header/DashboardHeaderScope.svelte';
	import InlineInfoBar from '$lib/dashboard/ui/shared/InlineInfoBar.svelte';
	import Table from './Table.svelte';
	import {
		getLikelyOutOfDateHeaderUiScope,
		LIKELY_OUT_OF_DATE_HEADER_SCOPE_ID
	} from './likely-out-of-date';
	import { getStaleLikelyOutOfDateSelectionRowIds } from './likely-out-of-date';

	type AllActivityTableRow = AllActivityListQueryResult['rows'][number];

	type Props = {
		rows: readonly AllActivityTableRow[];
	};

	let { rows }: Props = $props();
	let selectedRowIds = new SvelteSet<AllActivityTableRow['id']>();
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

	function toggleSelectedRow(rowId: AllActivityTableRow['id'], checked: boolean) {
		if (checked) {
			selectedRowIds.add(rowId);
		} else {
			selectedRowIds.delete(rowId);
		}
	}
</script>

<DashboardHeaderScope
	scopeId={LIKELY_OUT_OF_DATE_HEADER_SCOPE_ID}
	scope={getLikelyOutOfDateHeaderUiScope(selectedRowIds.size)}
/>

<Table {rows} {selection} />

{#if rows.length > 0}
	<InlineInfoBar
		dataAttribute="data-likely-out-of-date-info-bar"
		text="Our automatic data collection doesn't track in-person conversations so deals sometimes get out of date"
	/>
{/if}
