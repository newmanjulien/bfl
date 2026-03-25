<script lang="ts">
	import { Portal } from '@skeletonlabs/skeleton-svelte';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/support/cn';
	import { OVERLAY_LAYER_CLASS, type OverlayLayer } from './layers';
	import { getOverlayTarget } from './target';

	const OVERLAY_PORTAL_ROOT_CLASS = {
		anchored: 'fixed inset-0 pointer-events-none',
		viewport: 'fixed inset-0 pointer-events-auto'
	} as const;

	const OVERLAY_PORTAL_CONTENT_CLASS = {
		anchored: 'pointer-events-auto',
		viewport: 'pointer-events-auto h-full w-full'
	} as const;

	type Props = {
		layer?: OverlayLayer;
		kind?: keyof typeof OVERLAY_PORTAL_ROOT_CLASS;
		class?: string;
		contentClass?: string;
		children?: Snippet;
	};

	let {
		layer = 'floating',
		kind = 'anchored',
		class: className = '',
		contentClass = '',
		children
	}: Props = $props();

	const target = $derived(getOverlayTarget());
</script>

<Portal {target}>
	<div class={cn(OVERLAY_PORTAL_ROOT_CLASS[kind], OVERLAY_LAYER_CLASS[layer], className)}>
		<div class={cn(OVERLAY_PORTAL_CONTENT_CLASS[kind], contentClass)}>
			{@render children?.()}
		</div>
	</div>
</Portal>
