<script lang="ts">
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
		triggerLabel?: string;
	};

	let { menuId, people, triggerLabel = 'Switch' }: Props = $props();
	let isOpen = $state(false);
	let triggerElement = $state<HTMLButtonElement | null>(null);
	const panelId = $derived(`dashboard-menu-${menuId}`);
	const menuPanelClass = $derived(
		cn(DASHBOARD_MENU_PANEL_CLASS, DASHBOARD_MENU_PLACEMENT_CLASS['bottom-end'])
	);

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
		class="mr-2 flex h-7 items-center justify-center rounded-sm border border-zinc-100 px-2 text-xs font-medium tracking-wide text-zinc-500 transition-colors hover:bg-zinc-100"
		onclick={toggleMenu}
	>
		{triggerLabel}
	</button>

	{#if isOpen}
		<div id={panelId} role="menu" aria-orientation="vertical" class={menuPanelClass}>
			<p class="px-3 pt-3 pb-1 text-xs font-medium tracking-wide text-zinc-500">
				Switch broker
			</p>

			<ul class="mt-1 space-y-1">
				{#each people as person (person.id)}
					<li>
						<button
							type="button"
							role="menuitem"
							class="w-full rounded-md px-3 py-2 text-left text-xs text-zinc-700 transition-colors hover:bg-zinc-100"
							onclick={closeMenu}
						>
							<div class="flex items-center gap-2">
								<span class="inline-flex h-7 w-7 shrink-0 overflow-hidden rounded-full border border-zinc-200">
									<img
										src={person.avatar}
										alt={`${person.name} avatar`}
										class="h-full w-full object-cover"
									/>
								</span>
								<span class="font-medium">{person.name}</span>
							</div>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
