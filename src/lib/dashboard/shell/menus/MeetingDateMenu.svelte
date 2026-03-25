	<script lang="ts">
	import { Menu } from '@skeletonlabs/skeleton-svelte';
	import { activeMeetingDateIso } from '$lib/dashboard/meeting-date';
	import { shellState } from '$lib/dashboard/state.svelte';
	import { formatIsoDateMonthDayLong } from '$lib/format/date-time';
	import { mockDb } from '$lib/mock-db';
	import PortaledMenuPositioner from '$lib/ui/overlay/PortaledMenuPositioner.svelte';

	type Props = {
		menuId: string;
		placement?: 'bottom-start' | 'bottom-end' | 'bottom';
		triggerClass?: string;
	};

	let { menuId, placement = 'bottom-start', triggerClass = '' }: Props = $props();

	const meetingDateIsos = [...mockDb.meetings.listDateIsos()].sort((left, right) =>
		right.localeCompare(left)
	);
	const meetingDateLabels = meetingDateIsos.map(formatIsoDateMonthDayLong);
	const triggerDateIso = activeMeetingDateIso;
	const triggerDateLabel = formatIsoDateMonthDayLong(triggerDateIso);
</script>

<Menu
	open={shellState.isMenuOpen(menuId)}
	onOpenChange={(details: { open: boolean }) => shellState.setMenuOpen(menuId, details.open)}
	positioning={{ placement, gutter: 4 }}
>
	<Menu.Trigger
		class={triggerClass}
	>
		<span>{triggerDateLabel} meeting</span>
	</Menu.Trigger>

	<PortaledMenuPositioner>
		<Menu.Content class="min-w-56 rounded-md border border-zinc-100 bg-white p-1 shadow-sm">
			<p class="px-3 pt-3 pb-1 text-xs font-medium tracking-wide text-zinc-500">
				Select meeting date
			</p>

			<ul class="mt-1 space-y-1">
				{#each meetingDateIsos as isoDate, index (isoDate)}
					<li>
						<Menu.Item
							value={isoDate}
							class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-zinc-700 transition-colors hover:bg-zinc-100"
						>
							<span class="font-medium">{meetingDateLabels[index] ?? isoDate}</span>
						</Menu.Item>
					</li>
				{/each}
			</ul>
		</Menu.Content>
	</PortaledMenuPositioner>
</Menu>
