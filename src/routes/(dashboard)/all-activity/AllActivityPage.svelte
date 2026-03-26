<script lang="ts">
	import type { AllActivityView } from '$lib/dashboard/all-activity-routes';
	import { getDashboardLayoutMaxWidth } from '$lib/dashboard/layout/tokens';
	import AllActivityTable from './AllActivityTable.svelte';
	import LikelyOutOfDateTable from './LikelyOutOfDateTable.svelte';
	import type { AllActivityTableRow } from './projection';

	type Props = {
		data: {
			selectedView: AllActivityView;
			rows: readonly AllActivityTableRow[];
		};
	};

	let { data }: Props = $props();
	const maxWidth = getDashboardLayoutMaxWidth('wide');
</script>

<div class="relative mx-auto w-full" style={`max-width: ${maxWidth};`}>
	<div class="px-4 pt-8 pb-6 sm:px-6 lg:px-8">
		<div class="pt-1">
			{#if data.selectedView === 'likely-out-of-date'}
				<LikelyOutOfDateTable rows={data.rows} />
			{:else}
				<AllActivityTable rows={data.rows} />
			{/if}
		</div>
	</div>
</div>
