<script lang="ts">
	import { Ellipsis, PanelLeft } from 'lucide-svelte';
	import type { PersonSummary } from '$lib/domain/people';
	import type { DashboardHeader } from '$lib/dashboard/shell/dashboard-header';
	import {
		useDashboardHeaderUiController,
		type DashboardHeaderButtonId
	} from '$lib/dashboard/shell/dashboard-header-ui';
	import { useDashboardShellState } from '$lib/dashboard/state.svelte';
	import { mockDb } from '$lib/mock-db';
	import ActivityLevelFilterMenu from '$lib/dashboard/shell/menus/ActivityLevelFilterMenu.svelte';
	import BrokerFilterMenu from '$lib/dashboard/shell/menus/BrokerFilterMenu.svelte';
	import BrokerSwitchMenu from '$lib/dashboard/shell/menus/BrokerSwitchMenu.svelte';
	import ShareMenu from '$lib/dashboard/shell/menus/ShareMenu.svelte';
	import DesktopHeaderLeading from './DesktopHeaderLeading.svelte';

	type Props = {
		header: DashboardHeader | null | undefined;
	};

	let { header }: Props = $props();
	const shellState = useDashboardShellState();
	const headerUiController = useDashboardHeaderUiController();

	const people: PersonSummary[] = mockDb.brokers
		.list()
		.map(({ id, name, avatar }) => ({ id, name, avatar }));
	const overlayState = $derived(headerUiController.getState());
	const actionButtonClass =
		'flex h-7 items-center justify-center rounded-sm border border-zinc-100 px-2 text-xs font-medium tracking-wide text-zinc-500 transition-colors hover:bg-zinc-100';

	function runHeaderButton(buttonId: DashboardHeaderButtonId) {
		void overlayState.handlers[buttonId]?.();
	}
</script>

{#if header}
	<header class="hidden h-11 items-center border-b border-zinc-100 bg-white px-4 md:flex">
		<div class="flex min-w-0 flex-1 items-center">
			<button
				type="button"
				aria-label="Toggle sidebar"
				class="mr-1 ml-1 inline-flex items-center text-xs font-medium tracking-wide text-zinc-500 transition-colors hover:text-zinc-400"
				onclick={() => {
					shellState.isSidebarExpanded = !shellState.isSidebarExpanded;
				}}
			>
				<PanelLeft class="h-3.5 w-3.5" />
			</button>

			<DesktopHeaderLeading leading={header.leading} />
		</div>

		<div class="flex items-center gap-2">
			{#if header.actions}
				{#each header.actions as action (action)}
					{#if action === 'broker-switch'}
						<BrokerSwitchMenu menuId="desktop-broker-switch" {people} />
					{:else if action === 'share'}
						<ShareMenu menuId="desktop-share" {people} />
					{/if}
				{/each}
			{/if}

			{#if header.extra?.kind === 'add-deal'}
				<button
					type="button"
					data-dashboard-header-button="add-deal"
					class={actionButtonClass}
					onclick={() => runHeaderButton('add-deal')}
				>
					Add deal
				</button>
			{:else if header.extra?.kind === 'filters'}
				<div class="flex items-center gap-2">
					{#each header.extra.filters as filter (filter)}
						{#if filter === 'broker'}
							<BrokerFilterMenu menuId="desktop-broker-filter" {people} />
						{:else if filter === 'activity-level'}
							<ActivityLevelFilterMenu menuId="desktop-activity-filter" />
						{/if}
					{/each}
				</div>
			{/if}

			{#each overlayState.buttons as button (button.id)}
				<button
					type="button"
					data-dashboard-header-overlay-button
					data-dashboard-header-button={button.id}
					class={actionButtonClass}
					onclick={() => runHeaderButton(button.id)}
				>
					{button.label}
				</button>
			{/each}

			<button
				type="button"
				aria-label="More actions"
				class="flex h-7 w-7 items-center justify-center rounded-sm border border-zinc-100 text-zinc-500 transition-colors hover:bg-zinc-100"
			>
				<Ellipsis class="h-3 w-3" />
			</button>
		</div>
	</header>
{/if}
