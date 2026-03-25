<script lang="ts">
	import DashboardFeedLayout from '$lib/dashboard/layout/DashboardFeedLayout.svelte';
	import MyDealsTable from './MyDealsTable.svelte';

	let { data } = $props();
</script>

<DashboardFeedLayout width="wide">
	<MyDealsTable rows={data.rows} />
</DashboardFeedLayout>
