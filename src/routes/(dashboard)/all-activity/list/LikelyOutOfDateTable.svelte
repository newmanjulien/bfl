<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import type { AllActivityListPageData } from '$lib/dashboard/page-models/allActivity';
	import DashboardHeaderScope from '$lib/dashboard/shell/header/DashboardHeaderScope.svelte';
	import InlineInfoBar from '$lib/dashboard/ui/shared/InlineInfoBar.svelte';
	import Table from './Table.svelte';
	import {
		getLikelyOutOfDateHeaderUiScope,
		LIKELY_OUT_OF_DATE_HEADER_SCOPE_ID
	} from './likely-out-of-date';
	import { getStaleLikelyOutOfDateSelectionRowKeys } from './likely-out-of-date';

	type AllActivityTableRow = AllActivityListPageData['rows'][number];

	type Props = {
		rows: readonly AllActivityTableRow[];
	};

	let { rows }: Props = $props();
	let selectedRowKeys = new SvelteSet<AllActivityTableRow['key']>();
	const selection = {
		headerLabel: 'Select' as const,
		selectedRowKeys,
		onToggleRow: toggleSelectedRow
	};

	$effect(() => {
		const staleRowKeys = getStaleLikelyOutOfDateSelectionRowKeys(selectedRowKeys, rows);

		for (const rowKey of staleRowKeys) {
			selectedRowKeys.delete(rowKey);
		}
	});

	function toggleSelectedRow(rowKey: AllActivityTableRow['key'], checked: boolean) {
		if (checked) {
			selectedRowKeys.add(rowKey);
		} else {
			selectedRowKeys.delete(rowKey);
		}
	}
</script>

<DashboardHeaderScope
	scopeId={LIKELY_OUT_OF_DATE_HEADER_SCOPE_ID}
	scope={getLikelyOutOfDateHeaderUiScope(selectedRowKeys.size)}
/>

<Table {rows} {selection} />

{#if rows.length > 0}
	<InlineInfoBar
		dataAttribute="data-likely-out-of-date-info-bar"
		text="Our automatic data collection doesn't track in-person conversations so deals sometimes get out of date"
	/>
{/if}
