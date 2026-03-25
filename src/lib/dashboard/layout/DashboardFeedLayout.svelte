<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/support/cn';
	import {
		getDashboardLayoutMaxWidth,
		type DashboardLayoutWidth
	} from '$lib/dashboard/layout/tokens';

	type Props = {
		header?: Snippet;
		width?: DashboardLayoutWidth;
		class?: string;
		contentClass?: string;
		children?: Snippet;
	};

	let {
		header,
		width = 'normal',
		class: className = '',
		contentClass = '',
		children
	}: Props = $props();

	const maxWidth = $derived(getDashboardLayoutMaxWidth(width));
</script>

<div
	class={cn('dashboard-feed-layout relative mx-auto w-full', className)}
	style={`--dashboard-feed-max-width: ${maxWidth};`}
>
	<div class={cn('px-4 pt-8 pb-6 sm:px-6 lg:px-8', contentClass)}>
		{#if header}
			{@render header()}
		{/if}
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>

<style>
	.dashboard-feed-layout {
		max-width: var(--dashboard-feed-max-width);
	}
</style>
