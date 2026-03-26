<script lang="ts">
	import MyDealsPage from '../MyDealsPage.svelte';

	let { data } = $props();
</script>

<MyDealsPage {data} />
