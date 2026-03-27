<script lang="ts">
	import { cn } from '$lib/support/cn';
	import { formatIsoDateMonthDayLong } from '$lib/format/date-time';
	import type { IsoDate } from '$lib/types/dates';
	import DashboardMenuPanel from './DashboardMenuPanel.svelte';
	import {
		type DashboardMenuPlacement,
		dismissibleMenu
	} from './menu-interactions';
	import { useDashboardMenu } from './menu-state.svelte';

	type Props = {
		menuId: string;
		meetingDateIsos: readonly IsoDate[];
		activeMeetingDateIso?: IsoDate | null;
		placement?: DashboardMenuPlacement;
		class?: string;
	};

	let {
		menuId,
		meetingDateIsos: unsortedMeetingDateIsos,
		activeMeetingDateIso = null,
		placement = 'bottom-start',
		class: classProp = ''
	}: Props = $props();
	const menu = useDashboardMenu(
		() => menuId,
		() => placement
	);

	const meetingDateIsos = $derived(
		[...unsortedMeetingDateIsos].sort((left, right) => right.localeCompare(left))
	);
	const meetingDateLabels = $derived(meetingDateIsos.map(formatIsoDateMonthDayLong));
	const triggerDateIso = $derived(activeMeetingDateIso ?? meetingDateIsos[0] ?? null);
	const triggerDateLabel = $derived(
		triggerDateIso ? formatIsoDateMonthDayLong(triggerDateIso) : 'Select meeting date'
	);
</script>

<div
	use:dismissibleMenu={{ open: menu.isOpen, close: menu.close, trigger: menu.triggerElement }}
	class="relative inline-flex shrink-0"
>
	<button
		bind:this={menu.triggerElement}
		type="button"
		aria-haspopup="menu"
		aria-expanded={menu.isOpen}
		aria-controls={menu.isOpen ? menu.panelId : undefined}
		class={classProp}
		onclick={menu.toggle}
	>
		<span>{triggerDateIso ? `${triggerDateLabel} meeting` : triggerDateLabel}</span>
	</button>

	{#if menu.isOpen}
		<DashboardMenuPanel panelId={menu.panelId} class={menu.menuPanelClass} title="Select meeting date">
			{#snippet body()}
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
								onclick={menu.close}
							>
								<span class="font-medium">{meetingDateLabels[index] ?? isoDate}</span>
							</button>
						</li>
					{/each}
				</ul>
			{/snippet}
		</DashboardMenuPanel>
	{/if}
</div>
