<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import {
		resolveDashboardRoute,
		type DashboardRouteRef,
		type ExternalLink,
		type LinkTarget
	} from '$lib/dashboard/routing';
	import { cn } from '$lib/support/cn';

	type Props = {
		link?: LinkTarget<DashboardRouteRef> | { kind: 'none' };
		class?: string;
		body?: Snippet;
	};

	let {
		link = { kind: 'none' },
		class: classProp = '',
		body
	}: Props = $props();

	const cardClass = $derived(
		cn('block rounded-md border border-zinc-100 px-3 py-3 transition-colors hover:bg-zinc-50', classProp)
	);

	function getExternalAnchorProps(link: ExternalLink) {
		return {
			...(link.target ? { target: link.target } : {}),
			...(link.rel ? { rel: link.rel } : {})
		};
	}
</script>

{#if link.kind === 'internal'}
	<a href={resolve(resolveDashboardRoute(link.route))} class={cardClass}>
		{#if body}
			{@render body()}
		{/if}
	</a>
{:else if link.kind === 'external'}
	<a href={link.href} rel="external" {...getExternalAnchorProps(link)} class={cardClass}>
		{#if body}
			{@render body()}
		{/if}
	</a>
{:else}
	<div class={cardClass}>
		{#if body}
			{@render body()}
		{/if}
	</div>
{/if}
