<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import type { DashboardHeader } from '$lib/dashboard/types';
	import DesktopHeader from '$lib/dashboard/shell/DesktopHeader.svelte';
	import MobileDrawer from '$lib/dashboard/shell/MobileDrawer.svelte';
	import MobileHeader from '$lib/dashboard/shell/MobileHeader.svelte';
	import Sidebar from '$lib/dashboard/shell/Sidebar.svelte';
	import { shellState } from '$lib/dashboard/state.svelte';

	let { children } = $props();

	const header = $derived(page.data.header as DashboardHeader | null | undefined);

	onMount(() => {
		const desktopMedia = window.matchMedia('(min-width: 768px)');

		shellState.setSidebarExpanded(desktopMedia.matches);
		shellState.setMobileDrawerOpen(false);

		const onChange = (event: MediaQueryListEvent) => {
			if (event.matches) {
				shellState.setMobileDrawerOpen(false);
				return;
			}

			shellState.setSidebarExpanded(false);
		};

		desktopMedia.addEventListener('change', onChange);

		return () => {
			desktopMedia.removeEventListener('change', onChange);
		};
	});
</script>

<div class="h-dvh min-h-dvh overflow-hidden bg-zinc-50">
	<div
		class="dashboard-canvas flex h-full min-h-0 md:gap-(--dashboard-canvas-gap)"
		data-sidebar-state={shellState.isSidebarExpanded ? 'expanded' : 'collapsed'}
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
