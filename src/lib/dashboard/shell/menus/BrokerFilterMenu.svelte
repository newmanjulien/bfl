<script lang="ts">
	import { Check, ListFilter } from 'lucide-svelte';
	import type { PersonSummary } from '$lib/domain/people';
	import { cn } from '$lib/support/cn';
	import {
		DASHBOARD_MENU_PANEL_CLASS,
		DASHBOARD_MENU_PLACEMENT_CLASS,
		dismissibleMenu
	} from './menu-interactions';

	type Props = {
		menuId: string;
		people: PersonSummary[];
	};

	let { menuId, people }: Props = $props();
	let isOpen = $state(false);
	let triggerElement = $state<HTMLButtonElement | null>(null);

	const allPersonIds = $derived(people.map((person) => person.id));
	let selectedIds = $state<string[]>([]);
	const panelId = $derived(`dashboard-menu-${menuId}`);
	const menuPanelClass = $derived(
		cn(DASHBOARD_MENU_PANEL_CLASS, DASHBOARD_MENU_PLACEMENT_CLASS['bottom-end'])
	);

	$effect(() => {
		if (selectedIds.length === 0) {
			selectedIds = [...allPersonIds];
		}
	});

	function toggleSelectedId(selectedId: string, checked: boolean) {
		const hasId = selectedIds.includes(selectedId);

		if (checked && !hasId) {
			selectedIds = [...selectedIds, selectedId];
			return;
		}

		if (!checked && hasId) {
			selectedIds = selectedIds.filter((id) => id !== selectedId);
		}
	}

	function isSelected(personId: string) {
		return selectedIds.includes(personId);
	}

	function closeMenu() {
		isOpen = false;
	}

	function toggleMenu() {
		isOpen = !isOpen;
	}
</script>

<div
	use:dismissibleMenu={{ open: isOpen, close: closeMenu, trigger: triggerElement }}
	class="relative inline-flex shrink-0"
>
	<button
		bind:this={triggerElement}
		type="button"
		aria-haspopup="menu"
		aria-expanded={isOpen}
		aria-controls={isOpen ? panelId : undefined}
		class="flex h-7 items-center justify-center gap-1.5 rounded-sm border border-zinc-100 px-2 text-xs font-medium tracking-wide text-zinc-500 transition-colors hover:bg-zinc-100"
		onclick={toggleMenu}
	>
		<ListFilter class="size-3.5" />
		Filter brokers
	</button>

	{#if isOpen}
		<div id={panelId} role="menu" aria-orientation="vertical" class={menuPanelClass}>
			<p class="px-3 pt-3 pb-1 text-xs font-medium tracking-wide text-zinc-500">
				Filter by broker
			</p>

			<ul class="mt-1 space-y-1">
				{#each people as person (person.id)}
					{@const selected = isSelected(person.id)}
					<li>
						<button
							type="button"
							role="menuitemcheckbox"
							aria-checked={selected}
							class={cn(
								'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-100',
								selected ? 'bg-zinc-50 text-zinc-900' : 'text-zinc-700'
							)}
							onclick={() => toggleSelectedId(person.id, !selected)}
						>
							<div class="flex min-w-0 items-center gap-2">
								<span class="inline-flex h-7 w-7 shrink-0 overflow-hidden rounded-full border border-zinc-200">
									<img
										src={person.avatar}
										alt={`${person.name} avatar`}
										class="h-full w-full object-cover"
									/>
								</span>
								<span class="truncate">{person.name}</span>
							</div>
							<Check class={cn('ml-3 size-3.5 shrink-0 text-zinc-400', selected ? 'opacity-100' : 'opacity-0')} />
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
