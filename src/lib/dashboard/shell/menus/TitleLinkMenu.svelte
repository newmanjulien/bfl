<script lang="ts">
	import { resolve } from '$app/paths';
	import type { DashboardHeaderTitleMenu } from '$lib/dashboard/shell/dashboard-header';
	import { cn } from '$lib/support/cn';
	import {
		DASHBOARD_MENU_PANEL_CLASS,
		DASHBOARD_MENU_PLACEMENT_CLASS,
		type DashboardMenuPlacement,
		dismissibleMenu
	} from './menu-interactions';

	const BASE_TRIGGER_CLASS =
		'inline-flex items-center text-xs font-medium tracking-wide transition-colors';

	type Props = {
		menu: DashboardHeaderTitleMenu;
		placement?: DashboardMenuPlacement;
		class?: string;
	};

	let { menu, placement = 'bottom-start', class: classProp = '' }: Props = $props();
	let isOpen = $state(false);
	let triggerElement = $state<HTMLButtonElement | null>(null);

	const panelId = $derived(`dashboard-menu-${menu.menuId}`);
	const menuPanelClass = $derived(
		cn(DASHBOARD_MENU_PANEL_CLASS, DASHBOARD_MENU_PLACEMENT_CLASS[placement])
	);
	const triggerClass = $derived(
		classProp ? `${BASE_TRIGGER_CLASS} ${classProp}` : BASE_TRIGGER_CLASS
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
		aria-label={menu.ariaLabel}
		class={triggerClass}
		onclick={toggleMenu}
	>
		<span>{menu.activeLabel}</span>
	</button>

	{#if isOpen}
		<div id={panelId} role="menu" aria-orientation="vertical" class={menuPanelClass}>
			<p class="px-3 pt-3 pb-1 text-xs font-medium tracking-wide text-zinc-500">
				{menu.sectionLabel}
			</p>

			<ul class="mt-1 space-y-1">
				{#each menu.options as option (option.id)}
					<li>
						<a
							href={resolve(option.href)}
							role="menuitemradio"
							aria-checked={option.current}
							aria-current={option.current ? 'page' : undefined}
							class={cn(
								'flex w-full items-center rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-100',
								option.current ? 'bg-zinc-50 text-zinc-900' : 'text-zinc-700'
							)}
							onclick={closeMenu}
						>
							<span>{option.label}</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
