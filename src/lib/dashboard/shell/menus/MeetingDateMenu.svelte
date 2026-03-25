<script lang="ts">
	import { activeMeetingDateIso } from '$lib/dashboard/meeting-date';
	import { cn } from '$lib/support/cn';
	import { formatIsoDateMonthDayLong } from '$lib/format/date-time';
	import { mockDb } from '$lib/mock-db';
	import {
		DASHBOARD_MENU_PANEL_CLASS,
		DASHBOARD_MENU_PLACEMENT_CLASS,
		type DashboardMenuPlacement,
		dismissibleMenu
	} from './menu-interactions';

	type Props = {
		menuId: string;
		placement?: DashboardMenuPlacement;
		class?: string;
	};

	let { menuId, placement = 'bottom-start', class: classProp = '' }: Props = $props();
	let isOpen = $state(false);
	let triggerElement = $state<HTMLButtonElement | null>(null);

	const meetingDateIsos = [...mockDb.meetings.listDateIsos()].sort((left, right) =>
		right.localeCompare(left)
	);
	const meetingDateLabels = meetingDateIsos.map(formatIsoDateMonthDayLong);
	const triggerDateIso = activeMeetingDateIso;
	const triggerDateLabel = formatIsoDateMonthDayLong(triggerDateIso);
	const panelId = $derived(`dashboard-menu-${menuId}`);
	const menuPanelClass = $derived(
		cn(DASHBOARD_MENU_PANEL_CLASS, DASHBOARD_MENU_PLACEMENT_CLASS[placement])
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
		class={classProp}
		onclick={toggleMenu}
	>
		<span>{triggerDateLabel} meeting</span>
	</button>

	{#if isOpen}
		<div id={panelId} role="menu" aria-orientation="vertical" class={menuPanelClass}>
			<p class="px-3 pt-3 pb-1 text-xs font-medium tracking-wide text-zinc-500">
				Select meeting date
			</p>

			<ul class="mt-1 space-y-1">
				{#each meetingDateIsos as isoDate, index (isoDate)}
					<li>
						<button
							type="button"
							role="menuitemradio"
							aria-checked={isoDate === triggerDateIso}
							class={cn(
								'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-100',
								isoDate === triggerDateIso ? 'bg-zinc-50 text-zinc-900' : 'text-zinc-700'
							)}
							onclick={closeMenu}
						>
							<span class="font-medium">{meetingDateLabels[index] ?? isoDate}</span>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
