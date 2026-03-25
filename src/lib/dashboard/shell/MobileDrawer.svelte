<script lang="ts">
	import { resolve } from '$app/paths';
	import { X } from 'lucide-svelte';
	import { page } from '$app/state';
	import { DASHBOARD_NAV_GROUP_ORDER, DASHBOARD_NAV_GROUPS } from '$lib/dashboard/config';
	import { getActiveDashboardRoute } from '$lib/dashboard/routes';
	import { shellState } from '$lib/dashboard/state.svelte';
	import { cn } from '$lib/support/cn';
	import OverlayPortal from '$lib/ui/overlay/OverlayPortal.svelte';
	import HomeLink from './HomeLink.svelte';
	import NavIcon from './NavIcon.svelte';
	import { DASHBOARD_NAV_PRESENTATION } from './nav-presentation';

	const activeRoute = $derived(getActiveDashboardRoute(page.url.pathname));

	function getItemClassName(isActive: boolean, disabled = false) {
		return cn(
			'inline-flex h-10 w-full items-center justify-start gap-2.5 rounded-md px-2 text-xs tracking-wide text-zinc-600 transition-colors hover:bg-zinc-100/70 hover:text-zinc-900',
			disabled && 'pointer-events-none opacity-40',
			isActive && 'bg-zinc-100/70 text-zinc-900'
		);
	}
</script>

{#if shellState.isMobileDrawerOpen}
	<OverlayPortal layer="drawer" kind="viewport" class="md:hidden" contentClass="bg-white">
		<aside id="mobile-nav-drawer" class="flex h-full flex-col">
			<header class="flex h-11 items-center border-b border-zinc-100 bg-white px-(--shell-gutter-mobile)">
				<HomeLink onClick={() => shellState.setMobileDrawerOpen(false)} />
				<button
					type="button"
					aria-label="Close navigation menu"
					class="ml-auto inline-flex size-8 items-center justify-center rounded-sm text-zinc-700 transition-colors hover:bg-zinc-100"
					onclick={() => shellState.setMobileDrawerOpen(false)}
				>
					<X class="size-4" />
				</button>
			</header>

			<div class="flex-1 overflow-y-auto px-(--shell-gutter-mobile) py-4">
				<nav aria-label="Dashboard navigation" class="relative mt-2 flex min-h-full flex-col">
					{#each DASHBOARD_NAV_GROUP_ORDER as groupId (groupId)}
						{@const presentation = DASHBOARD_NAV_PRESENTATION[groupId]}
						<div
							class={cn(
								'flex flex-col',
								presentation.mobileSectionClassName,
								groupId === 'bottom' && 'mt-auto'
							)}
						>
							{#if presentation.heading}
								<p class="px-2 pb-2 text-[11px] uppercase tracking-wide text-zinc-400">
									{presentation.heading}
								</p>
							{/if}

							<ul class="flex flex-col gap-1.5">
								{#each DASHBOARD_NAV_GROUPS[groupId] as item (item.kind === 'route' ? item.href : `${groupId}:${item.label}`)}
									<li>
										<span class="inline-flex w-full">
											{#if item.kind === 'disabled'}
												<span class={getItemClassName(false, true)}>
													<NavIcon icon={item.icon} class="size-3.5 shrink-0" />
													<span class="min-w-0 truncate">{item.label}</span>
												</span>
											{:else}
												<a
													href={resolve(item.href)}
													class={getItemClassName(activeRoute === item.href)}
													onclick={() => shellState.setMobileDrawerOpen(false)}
												>
													<NavIcon icon={item.icon} class="size-3.5 shrink-0" />
													<span class="min-w-0 truncate">{item.label}</span>
												</a>
											{/if}
										</span>
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</nav>
			</div>
		</aside>
	</OverlayPortal>
{/if}
