<script lang="ts">
	import { ChevronDown, Search } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/support/cn';
	import type { AllActivityFilterSectionId } from './model';
	import type { AllActivityFilterDrawerSection } from './sections';

	type Props = {
		section: AllActivityFilterDrawerSection;
		showDivider?: boolean;
		onToggleSection: (sectionId: AllActivityFilterSectionId) => void;
		children?: Snippet;
	};

	let {
		section,
		showDivider = false,
		onToggleSection,
		children
	}: Props = $props();
</script>

<section
	data-all-activity-filter-section={section.id}
	class={cn(showDivider && 'border-t border-zinc-100', 'px-4 py-4')}
>
	{#if section.collapsible}
		<button
			type="button"
			class="flex w-full items-center gap-3 text-left"
			aria-expanded={section.expanded}
			onclick={() => onToggleSection(section.id)}
		>
			<div class="min-w-0 flex-1">
				<p class="text-[9px] uppercase tracking-[0.16em] text-zinc-400">{section.title}</p>
				<p
					data-all-activity-filter-summary={section.id}
					class="mt-1 text-[11px] tracking-wide text-zinc-500"
				>
					{section.summary}
				</p>
			</div>
			<ChevronDown
				class={cn(
					'size-3.5 shrink-0 text-zinc-400 transition-transform',
					section.expanded && 'rotate-180'
				)}
			/>
		</button>
	{:else}
		<div class="flex w-full items-center gap-3 text-left">
			<div class="min-w-0 flex-1">
				<p class="text-[9px] uppercase tracking-[0.16em] text-zinc-400">{section.title}</p>
				<p
					data-all-activity-filter-summary={section.id}
					class="mt-1 text-[11px] tracking-wide text-zinc-500"
				>
					{section.summary}
				</p>
			</div>
		</div>
	{/if}

	{#if section.expanded}
		<div class="mt-3 space-y-3">
			{#if section.search}
				<div class="relative">
					<Search class="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-400" />
					<input
						type="search"
						disabled={section.search.disabled}
						aria-label={section.search.label}
						placeholder={section.search.placeholder}
						class="w-full rounded-md border border-zinc-100 bg-zinc-50 px-9 py-2 text-xs tracking-wide text-zinc-400 placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-100"
					/>
				</div>
			{/if}

			{#if children}
				{@render children()}
			{/if}
		</div>
	{/if}
</section>
