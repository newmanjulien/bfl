<script lang="ts">
	import { cn } from '$lib/support/cn';

	type Props = {
		class?: string;
		children?: import('svelte').Snippet;
		icon?: import('svelte').Snippet;
	};

	let { class: className = '', children, icon }: Props = $props();
</script>

<span
	class={cn(
		'inline-flex items-center gap-1 rounded-md border border-zinc-100 px-2 py-0.5 text-[11px] tracking-wide text-zinc-800',
		className
	)}
>
	{#if icon}
		{@render icon()}
	{/if}
	{#if children}
		{@render children()}
	{/if}
</span>
