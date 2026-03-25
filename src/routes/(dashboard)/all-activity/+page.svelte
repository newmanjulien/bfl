<script lang="ts">
	import DashboardFeedLayout from '$lib/dashboard/layout/DashboardFeedLayout.svelte';
	import AllActivityTable from './AllActivityTable.svelte';

	let { data } = $props();
</script>

<DashboardFeedLayout width="wide">
	<AllActivityTable rows={data.rows} />
</DashboardFeedLayout>
