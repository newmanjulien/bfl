<script lang="ts">
	import { resolve } from '$app/paths';
	import { X } from 'lucide-svelte';
	import { page } from '$app/state';
	import { useDashboardShellState } from '$lib/dashboard/state.svelte';
	import { cn } from '$lib/support/cn';
	import { DASHBOARD_NAV_SECTIONS, getActiveDashboardNavHref } from './dashboard-nav';
	import HomeLink from './HomeLink.svelte';

	const activeRoute = $derived(getActiveDashboardNavHref(page.url.pathname));
	const shellState = useDashboardShellState();

	function getItemClassName(isActive: boolean, disabled = false) {
		return cn(
			'inline-flex h-10 w-full items-center justify-start gap-2.5 rounded-md px-2 text-xs tracking-wide text-zinc-600 transition-colors hover:bg-zinc-100/70 hover:text-zinc-900',
			disabled && 'pointer-events-none opacity-40',
			isActive && 'bg-zinc-100/70 text-zinc-900'
		);
	}
</script>

{#if shellState.isMobileDrawerOpen}
	<div class="app-layer-drawer fixed inset-0 pointer-events-auto md:hidden">
		<aside id="mobile-nav-drawer" class="flex h-full flex-col bg-white">
			<header class="flex h-11 items-center border-b border-zinc-100 bg-white px-(--shell-gutter-mobile)">
				<HomeLink
					onclick={() => {
						shellState.isMobileDrawerOpen = false;
					}}
				/>
				<button
					type="button"
					aria-label="Close navigation menu"
					class="ml-auto inline-flex size-8 items-center justify-center rounded-sm text-zinc-700 transition-colors hover:bg-zinc-100"
					onclick={() => {
						shellState.isMobileDrawerOpen = false;
					}}
				>
					<X class="size-4" />
				</button>
			</header>

			<div class="flex-1 overflow-y-auto px-(--shell-gutter-mobile) py-4">
				<nav aria-label="Dashboard navigation" class="relative mt-2 flex min-h-full flex-col">
					{#each DASHBOARD_NAV_SECTIONS as section (section.id)}
						<div
							class={cn(
								'flex flex-col',
								section.mobileSectionClass,
								section.id === 'bottom' && 'mt-auto'
							)}
						>
							{#if section.heading}
								<p class="px-2 pb-2 text-[11px] uppercase tracking-wide text-zinc-400">
									{section.heading}
								</p>
							{/if}

							<ul class="flex flex-col gap-1.5">
								{#each section.items as item (item.kind === 'route' ? item.href : `${section.id}:${item.label}`)}
									{@const Icon = item.icon}
									<li>
										<span class="inline-flex w-full">
											{#if item.kind === 'disabled'}
												<span class={getItemClassName(false, true)}>
													<Icon class="size-3.5 shrink-0" />
													<span class="min-w-0 truncate">{item.label}</span>
												</span>
											{:else}
												<a
													href={resolve(item.href)}
													class={getItemClassName(activeRoute === item.href)}
													onclick={() => {
														shellState.isMobileDrawerOpen = false;
													}}
												>
													<Icon class="size-3.5 shrink-0" />
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
	</div>
{/if}
