<script lang="ts">
	import { cn } from '$lib/support/cn';
	import { formatIsoDateMonthDayLong } from '$lib/format/date-time';
	import type { DashboardMeeting } from '$lib/dashboard/read-models';
	import type { OpportunitiesListRouteRef, SinceLastMeetingRouteRef } from '$lib/dashboard/routing';
	import { resolveDashboardRoute } from '$lib/dashboard/routing';
	import { resolveDashboardHref } from '$lib/dashboard/routing/href';
	import DashboardMenuPanel from './DashboardMenuPanel.svelte';
	import {
		type DashboardMenuPlacement,
		dismissibleMenu
	} from './menu-interactions';
	import { useDashboardMenu } from './menu-state.svelte';

	type Props = {
		menuId: string;
		route: OpportunitiesListRouteRef | SinceLastMeetingRouteRef;
		meetings: readonly DashboardMeeting[];
		placement?: DashboardMenuPlacement;
		class?: string;
	};

	let {
		menuId,
		route,
		meetings: unsortedMeetings,
		placement = 'bottom-start',
		class: classProp = ''
	}: Props = $props();
	const menu = useDashboardMenu(
		() => menuId,
		() => placement
	);

	const meetings = $derived(
		[...unsortedMeetings].sort((left, right) => right.dateIso.localeCompare(left.dateIso))
	);
	const meetingDateLabels = $derived(meetings.map((meeting) => formatIsoDateMonthDayLong(meeting.dateIso)));
	const triggerMeeting = $derived(
		meetings.find((meeting) => meeting.id === route.meetingId) ?? meetings[0] ?? null
	);
	const triggerDateLabel = $derived(
		triggerMeeting ? formatIsoDateMonthDayLong(triggerMeeting.dateIso) : 'Select meeting date'
	);

	function toMeetingRoute(meetingId: DashboardMeeting['id']) {
		return route.kind === 'opportunities-list'
			? {
					kind: 'opportunities-list' as const,
					meetingId
				}
			: {
					kind: 'since-last-meeting' as const,
					meetingId
				};
	}
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
		<span>{triggerMeeting ? `${triggerDateLabel} meeting` : triggerDateLabel}</span>
	</button>

	{#if menu.isOpen}
		<DashboardMenuPanel panelId={menu.panelId} class={menu.menuPanelClass} title="Select meeting date">
			{#snippet body()}
				<ul class="mt-1 space-y-1">
					{#each meetings as meeting, index (meeting.id)}
						<li>
							<a
								role="menuitemradio"
								aria-checked={meeting.id === triggerMeeting?.id}
								href={resolveDashboardHref(toMeetingRoute(meeting.id))}
								class={cn(
									'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-100',
									meeting.id === triggerMeeting?.id ? 'bg-zinc-50 text-zinc-900' : 'text-zinc-700'
								)}
								onclick={menu.close}
							>
								<span class="font-medium">{meetingDateLabels[index] ?? meeting.dateIso}</span>
							</a>
						</li>
					{/each}
				</ul>
			{/snippet}
		</DashboardMenuPanel>
	{/if}
</div>
