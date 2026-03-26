<script lang="ts">
	import { Check, X } from 'lucide-svelte';
	import { getDashboardDetailRailWidth } from '$lib/dashboard/layout/tokens';
	import { cn } from '$lib/support/cn';
	import ActivityLevelGridIcon from '$lib/ui/custom/ActivityLevelGridIcon.svelte';
	import AllActivityFilterDrawerSectionShell from './AllActivityFilterDrawerSection.svelte';
	import type {
		AllActivityFilterDrawerSection,
		AllActivityFilterOptionToggle,
		AllActivityFilterSectionId
	} from './filter-drawer';

	type Props = {
		open: boolean;
		sections: readonly AllActivityFilterDrawerSection[];
		onClose: () => void;
		onToggleSection: (sectionId: AllActivityFilterSectionId) => void;
		onToggleOption: (toggle: AllActivityFilterOptionToggle) => void;
	};

	let {
		open,
		sections,
		onClose,
		onToggleSection,
		onToggleOption
	}: Props = $props();

	const drawerWidth = getDashboardDetailRailWidth('standard');

	$effect(() => {
		if (!open) {
			return;
		}

		function handleDocumentKeydown(event: KeyboardEvent) {
			if (event.key !== 'Escape') {
				return;
			}

			event.preventDefault();
			onClose();
		}

		document.addEventListener('keydown', handleDocumentKeydown);

		return () => {
			document.removeEventListener('keydown', handleDocumentKeydown);
		};
	});

	function getOptionClassName(selected: boolean) {
		return cn(
			'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-100',
			selected ? 'bg-zinc-50 text-zinc-900' : 'text-zinc-700'
		);
	}
</script>

{#if open}
	<div
		class="app-layer-drawer pointer-events-none absolute inset-0 hidden md:block"
		data-all-activity-filter-drawer-root
	>
		<button
			type="button"
			aria-label="Close filters"
			class="pointer-events-auto absolute inset-0 bg-zinc-950/5"
			onclick={onClose}
		></button>

		<aside
			data-all-activity-filter-drawer
			class="pointer-events-auto absolute inset-y-0 right-0 flex flex-col border-l border-zinc-100 bg-white"
			style={`width: ${drawerWidth};`}
		>
			<header class="flex h-11 items-center border-b border-zinc-100 px-4">
				<h2 class="text-xs font-medium tracking-wide text-zinc-900">Filters</h2>
				<button
					type="button"
					aria-label="Close filters"
					class="ml-auto inline-flex size-8 items-center justify-center rounded-sm text-zinc-700 transition-colors hover:bg-zinc-100"
					onclick={onClose}
				>
					<X class="size-4" />
				</button>
			</header>

			<div class="min-h-0 flex-1 overflow-y-auto bg-white">
				{#each sections as section, sectionIndex (section.id)}
					<AllActivityFilterDrawerSectionShell
						{section}
						showDivider={sectionIndex > 0}
						{onToggleSection}
					>
						<ul class="space-y-1">
							{#if section.id === 'broker'}
								{#each section.options as option (option.id)}
									<li>
										<button
											type="button"
											aria-pressed={option.selected}
											class={getOptionClassName(option.selected)}
											onclick={() =>
												onToggleOption({
													sectionId: section.id,
													optionId: option.id
												})}
										>
											<div class="flex min-w-0 items-center gap-2">
												<span class="inline-flex h-7 w-7 shrink-0 overflow-hidden rounded-full border border-zinc-200">
													<img
														src={option.avatar}
														alt={`${option.label} avatar`}
														class="h-full w-full object-cover"
													/>
												</span>
												<span class="truncate">{option.label}</span>
											</div>
											<Check
												class={cn(
													'ml-3 size-3.5 shrink-0 text-zinc-400',
													option.selected ? 'opacity-100' : 'opacity-0'
												)}
											/>
										</button>
									</li>
								{/each}
							{:else if section.id === 'activity-level'}
								{#each section.options as option (option.id)}
									<li>
										<button
											type="button"
											aria-pressed={option.selected}
											class={getOptionClassName(option.selected)}
											onclick={() =>
												onToggleOption({
													sectionId: section.id,
													optionId: option.id
												})}
										>
											<div class="flex min-w-0 items-center gap-2">
												<ActivityLevelGridIcon
													variant={option.iconVariant}
													class="size-3 text-zinc-400"
												/>
												<span class="truncate">{option.label}</span>
											</div>
											<Check
												class={cn(
													'ml-3 size-3.5 shrink-0 text-zinc-400',
													option.selected ? 'opacity-100' : 'opacity-0'
												)}
											/>
										</button>
									</li>
								{/each}
							{:else}
								{#each section.options as option (option.id)}
									<li>
										<button
											type="button"
											aria-pressed={option.selected}
											class={getOptionClassName(option.selected)}
											onclick={() =>
												onToggleOption({
													sectionId: section.id,
													optionId: option.id
												})}
										>
											<span class="truncate">{option.label}</span>
											<Check
												class={cn(
													'ml-3 size-3.5 shrink-0 text-zinc-400',
													option.selected ? 'opacity-100' : 'opacity-0'
												)}
											/>
										</button>
									</li>
								{/each}
							{/if}
						</ul>
					</AllActivityFilterDrawerSectionShell>
				{/each}
			</div>
		</aside>
	</div>
{/if}
