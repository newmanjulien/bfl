<script lang="ts">
	import { Ellipsis, PanelLeft } from 'lucide-svelte';
	import type { PersonSummary } from '$lib/domain/people';
	import type { DashboardHeader } from '$lib/dashboard/shell/dashboard-header';
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

	const people: PersonSummary[] = mockDb.brokers
		.list()
		.map(({ id, name, avatar }) => ({ id, name, avatar }));
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

			{#if header.extra === 'add-deal'}
				<button
					type="button"
					class="mr-2 flex h-7 items-center justify-center rounded-sm border border-zinc-100 px-2 text-xs font-medium tracking-wide text-zinc-500 transition-colors hover:bg-zinc-100"
				>
					Add deal
				</button>
			{:else if header.extra === 'all-activity-filters'}
				<div class="flex items-center gap-2">
					<BrokerFilterMenu menuId="desktop-broker-filter" {people} />
					<ActivityLevelFilterMenu menuId="desktop-activity-filter" />
				</div>
			{/if}

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
