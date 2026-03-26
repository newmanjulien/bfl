<script lang="ts">
	import { page } from '$app/state';
	import { MediaQuery } from 'svelte/reactivity';
	import { getDashboardHeader } from '$lib/dashboard/shell/dashboard-header';
	import DesktopHeader from '$lib/dashboard/shell/DesktopHeader.svelte';
	import MobileDrawer from '$lib/dashboard/shell/MobileDrawer.svelte';
	import MobileHeader from '$lib/dashboard/shell/MobileHeader.svelte';
	import {
		createDashboardHeaderUiController,
		provideDashboardHeaderUiController
	} from '$lib/dashboard/shell/dashboard-header-ui';
	import Sidebar from '$lib/dashboard/shell/Sidebar.svelte';
	import {
		provideDashboardShellState,
		type DashboardShellState
	} from '$lib/dashboard/state.svelte';

	let { children } = $props();

	const header = $derived(getDashboardHeader(page.url.pathname, page.data));
	const desktopViewport = new MediaQuery('(min-width: 768px)', true);
	const shellState = $state<DashboardShellState>({
		isSidebarExpanded: true,
		isMobileDrawerOpen: false
	});
	const headerUiController = createDashboardHeaderUiController();

	provideDashboardShellState(shellState);
	provideDashboardHeaderUiController(headerUiController);

	$effect(() => {
		if (desktopViewport.current && shellState.isMobileDrawerOpen) {
			shellState.isMobileDrawerOpen = false;
		}
	});
</script>

<div class="h-dvh min-h-dvh overflow-hidden bg-zinc-50">
	<div
		class="dashboard-canvas flex h-full min-h-0 md:gap-(--dashboard-canvas-gap)"
		data-sidebar-state={desktopViewport.current && shellState.isSidebarExpanded ? 'expanded' : 'collapsed'}
	>
		<Sidebar class="hidden md:flex" />
		<main class="min-w-0 flex min-h-0 flex-1 flex-col overflow-hidden bg-white md:rounded-sm md:border md:border-zinc-100">
			<MobileDrawer />
			<MobileHeader {header} />
			<div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
				<DesktopHeader {header} />
				<div class="dashboard-main-viewport min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
					<div class="min-h-full min-w-0">
						{@render children()}
					</div>
				</div>
			</div>
		</main>
	</div>
</div>
