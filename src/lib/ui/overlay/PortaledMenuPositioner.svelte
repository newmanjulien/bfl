<script lang="ts">
	import { Menu } from '@skeletonlabs/skeleton-svelte';
	import type { Snippet } from 'svelte';
	import OverlayPortal from './OverlayPortal.svelte';

	type Props = {
		class?: string;
		children?: Snippet;
	};

	let { class: className = '', children }: Props = $props();
</script>

<OverlayPortal layer="floating" kind="anchored">
	<Menu.Positioner class={className}>
		{@render children?.()}
	</Menu.Positioner>
</OverlayPortal>
