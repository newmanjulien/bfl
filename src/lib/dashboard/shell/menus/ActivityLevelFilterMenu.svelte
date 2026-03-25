<script lang="ts">
	import { Check, ListFilter } from 'lucide-svelte';
	import {
		getActivityLevelIconVariant,
		getActivityLevelLabel
	} from '$lib/presentation/activity-level';
	import { ACTIVITY_LEVELS, type ActivityLevel } from '$lib/domain/activity-level';
	import { cn } from '$lib/support/cn';
	import ActivityLevelGridIcon from '$lib/ui/custom/ActivityLevelGridIcon.svelte';
	import {
		DASHBOARD_MENU_PANEL_CLASS,
		DASHBOARD_MENU_PLACEMENT_CLASS,
		dismissibleMenu
	} from './menu-interactions';

	type Props = {
		menuId: string;
	};

	let { menuId }: Props = $props();
	let isOpen = $state(false);
	let triggerElement = $state<HTMLButtonElement | null>(null);
	let selectedLevels = $state<ActivityLevel[]>([...ACTIVITY_LEVELS]);
	const panelId = $derived(`dashboard-menu-${menuId}`);
	const menuPanelClass = $derived(
		cn(DASHBOARD_MENU_PANEL_CLASS, DASHBOARD_MENU_PLACEMENT_CLASS['bottom-end'])
	);

	function toggleSelectedLevel(selectedLevel: ActivityLevel, checked: boolean) {
		const hasLevel = selectedLevels.includes(selectedLevel);

		if (checked && !hasLevel) {
			selectedLevels = [...selectedLevels, selectedLevel];
			return;
		}

		if (!checked && hasLevel) {
			selectedLevels = selectedLevels.filter((level) => level !== selectedLevel);
		}
	}

	function isSelected(level: ActivityLevel) {
		return selectedLevels.includes(level);
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
		Filter activity level
	</button>

	{#if isOpen}
		<div id={panelId} role="menu" aria-orientation="vertical" class={menuPanelClass}>
			<p class="px-3 pt-3 pb-1 text-xs font-medium tracking-wide text-zinc-500">
				Filter by activity level
			</p>

			<ul class="mt-1 space-y-1">
				{#each ACTIVITY_LEVELS as activityLevel (activityLevel)}
					{@const selected = isSelected(activityLevel)}
					<li>
						<button
							type="button"
							role="menuitemcheckbox"
							aria-checked={selected}
							class={cn(
								'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-100',
								selected ? 'bg-zinc-50 text-zinc-900' : 'text-zinc-700'
							)}
							onclick={() => toggleSelectedLevel(activityLevel, !selected)}
						>
							<div class="flex min-w-0 items-center gap-2">
								<ActivityLevelGridIcon
									variant={getActivityLevelIconVariant(activityLevel)}
									class="size-3 text-zinc-400"
								/>
								<span class="truncate">{getActivityLevelLabel(activityLevel)}</span>
							</div>
							<Check class={cn('ml-3 size-3.5 shrink-0 text-zinc-400', selected ? 'opacity-100' : 'opacity-0')} />
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
