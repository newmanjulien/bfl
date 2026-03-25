<script lang="ts">
	import { cn } from '$lib/support/cn';

	type SectionTab = {
		id: string;
		label: string;
	};

	type Props = {
		tabs: readonly SectionTab[];
		value?: string;
		class?: string;
	};

	let { tabs, value = $bindable(''), class: className = '' }: Props = $props();
</script>

<div class={cn('flex w-full items-center gap-6', className)}>
	{#each tabs as tab (tab.id)}
		<button
			type="button"
			class={cn(
				'relative inline-flex cursor-pointer items-center appearance-none border-0 bg-transparent px-0 pb-3 text-xs leading-relaxed font-medium tracking-wide transition-colors',
				value === tab.id ? 'text-zinc-900' : 'text-zinc-500'
			)}
			onclick={() => {
				value = tab.id;
			}}
		>
			{tab.label}
			{#if value === tab.id}
				<span class="absolute inset-x-0 bottom-px h-px bg-zinc-900"></span>
			{/if}
		</button>
	{/each}
</div>
