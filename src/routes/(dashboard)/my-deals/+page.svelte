<script lang="ts">
	import { getDashboardLayoutMaxWidth } from '$lib/dashboard/layout/tokens';
	import MyDealsTable from './MyDealsTable.svelte';

	let { data } = $props();
	const maxWidth = getDashboardLayoutMaxWidth('wide');
</script>

<div class="relative mx-auto w-full" style={`max-width: ${maxWidth};`}>
	<div class="px-4 pt-8 pb-6 sm:px-6 lg:px-8">
		<MyDealsTable rows={data.rows} />
	</div>
</div>
