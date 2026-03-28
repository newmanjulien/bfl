<script lang="ts">
	import Page from '../../../all-activity/detail/Page.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Page {data} />
