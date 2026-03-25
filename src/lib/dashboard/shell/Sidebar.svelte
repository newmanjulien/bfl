<script lang="ts">
	import { resolve } from '$app/paths';
	import { ChevronsUpDown } from 'lucide-svelte';
	import { page } from '$app/state';
	import { fly } from 'svelte/transition';
	import { useDashboardShellState } from '$lib/dashboard/state.svelte';
	import { cn } from '$lib/support/cn';
	import { sidebarIndicator } from './sidebar-indicator';
	import {
		DASHBOARD_NAV_SECTIONS,
		getActiveDashboardNavHref,
		type DashboardNavSectionId
	} from './dashboard-nav';
	import type { DashboardStaticHref } from '$lib/dashboard/routes';
	import HomeLink from './HomeLink.svelte';

	type Props = {
		class?: string;
	};

	let { class: className = '' }: Props = $props();

	const shellState = useDashboardShellState();
	const activeRoute = $derived(getActiveDashboardNavHref(page.url.pathname));
	let hoveredHref = $state<DashboardStaticHref | null>(null);

	const bottomRouteHrefs = new Set(
		DASHBOARD_NAV_SECTIONS.flatMap((section) =>
			section.id === 'bottom'
				? section.items.flatMap((item) => (item.kind === 'route' ? [item.href] : []))
				: []
		)
	);
	const indicatorTarget = $derived.by(() => {
		const targetHref = hoveredHref ?? activeRoute;

		return {
			targetKey: targetHref,
			enabled: Boolean(targetHref && !bottomRouteHrefs.has(targetHref))
		};
	});

	function isBottomSection(sectionId: DashboardNavSectionId) {
		return sectionId === 'bottom';
	}

	function shouldShowCollapsedDivider(sectionIndex: number) {
		if (shellState.isSidebarExpanded) return false;

		const section = DASHBOARD_NAV_SECTIONS[sectionIndex];
		const previousSection = DASHBOARD_NAV_SECTIONS[sectionIndex - 1];

		return Boolean(section?.showCollapsedDivider && previousSection?.items.length && section.items.length);
	}

	function getContainerClassName(sectionId: DashboardNavSectionId) {
		return cn(
			'relative',
			shellState.isSidebarExpanded ? 'block w-full' : 'inline-flex',
			isBottomSection(sectionId) && !shellState.isSidebarExpanded && 'self-center'
		);
	}

	function getItemClassName(params: {
		sectionId: DashboardNavSectionId;
		isActive: boolean;
		disabled?: boolean;
	}) {
		const { sectionId, isActive, disabled = false } = params;
		const isBottom = isBottomSection(sectionId);

		return cn(
			'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm tracking-wide transition-colors',
			shellState.isSidebarExpanded
				? 'h-7 w-full justify-start gap-2.5 rounded-sm border border-transparent px-2 text-xs text-zinc-600 hover:bg-transparent hover:text-zinc-800'
				: isBottom
					? 'size-7 justify-center rounded-full border border-zinc-100 bg-white text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700'
					: 'size-7 justify-center rounded-sm border border-transparent text-zinc-500 hover:bg-transparent hover:text-zinc-800',
			disabled && 'pointer-events-none opacity-50',
			isActive &&
				(shellState.isSidebarExpanded
					? 'text-zinc-900'
					: isBottom
						? 'border-zinc-300 bg-white text-zinc-900'
						: 'text-zinc-900')
		);
	}

</script>

<aside
	class={cn(
		'flex w-(--dashboard-sidebar-width) shrink-0 self-stretch flex-col overflow-hidden pt-2.5 pl-(--dashboard-sidebar-pad-left) pr-(--dashboard-sidebar-pad-right) transition-[width,padding] duration-200',
		shellState.isSidebarExpanded ? 'items-stretch' : 'items-start',
		className
	)}
	aria-label="Dashboard sidebar"
>
	<div class="mb-4 ml-0.5 flex w-full items-center pr-0.5">
		<HomeLink class="shrink-0" />

		<div
			class={cn(
				'ml-auto flex shrink-0 items-center overflow-hidden transition-[max-width,opacity,transform] duration-200',
				shellState.isSidebarExpanded
					? 'max-w-24 translate-x-0 opacity-100'
					: 'pointer-events-none max-w-0 translate-x-1 opacity-0'
			)}
		>
			<div class="inline-flex h-6 origin-center scale-110 items-center gap-1 rounded-full border border-zinc-100 bg-zinc-50 px-1 text-zinc-100">
				<span class="inline-flex size-5 shrink-0 overflow-hidden rounded-full border border-zinc-100 bg-white">
					<img
						src="/avatars/yash.webp"
						alt="User profile avatar"
						class="h-full w-full object-cover"
					/>
				</span>
				<ChevronsUpDown aria-hidden="true" class="h-3 w-3 text-zinc-400" />
			</div>
		</div>
	</div>

	<nav
		use:sidebarIndicator={indicatorTarget}
		class="relative flex min-h-0 flex-1 flex-col"
		aria-label="Dashboard navigation"
		onmouseleave={() => {
			hoveredHref = null;
		}}
	>
		<span
			aria-hidden="true"
			class="sidebar-nav-indicator pointer-events-none absolute rounded-sm bg-zinc-200/60 transition-[top,left,width,height,opacity] duration-200 ease-out"
		></span>
		{#each DASHBOARD_NAV_SECTIONS as section, sectionIndex (section.id)}
			<div
				class={cn(
					'flex flex-col',
					(section.id === 'bottom' || shellState.isSidebarExpanded) &&
						section.desktopSectionClass,
					section.id === 'bottom' && 'mt-auto pb-1'
				)}
			>
				{#if section.heading && shellState.isSidebarExpanded}
					<div class="mb-2" in:fly={{ x: -4, duration: 200 }}>
						<p class="px-2 text-[11px] uppercase tracking-wide text-zinc-400">
							{section.heading}
						</p>
					</div>
				{:else if shouldShowCollapsedDivider(sectionIndex)}
					<div class="py-3">
						<span aria-hidden="true" class="mx-auto block h-px w-4 bg-zinc-200/50"></span>
					</div>
				{/if}

				<ul class="flex flex-col gap-1.5">
					{#each section.items as item (item.kind === 'route' ? item.href : `${section.id}:${item.label}`)}
						{@const Icon = item.icon}
						<li>
							{#if item.kind === 'disabled'}
								<span class={getContainerClassName(section.id)}>
									<span class={getItemClassName({ sectionId: section.id, isActive: false, disabled: true })}>
										<Icon class="size-3.5 shrink-0" />
										{#if shellState.isSidebarExpanded}
											<span class="min-w-0 overflow-hidden" in:fly={{ x: -4, duration: 200 }}>
												<span class="block truncate text-left">{item.label}</span>
											</span>
										{:else}
											<span class="sr-only">{item.label}</span>
										{/if}
									</span>
								</span>
								{:else}
									<span class={getContainerClassName(section.id)}>
										<a
											href={resolve(item.href)}
											data-sidebar-indicator-key={item.href}
											class={getItemClassName({
												sectionId: section.id,
												isActive: activeRoute === item.href
										})}
										onmouseenter={() => {
											if (!isBottomSection(section.id)) {
												hoveredHref = item.href;
											}
										}}
									>
										<Icon class="size-3.5 shrink-0" />
										{#if shellState.isSidebarExpanded}
											<span class="min-w-0 overflow-hidden" in:fly={{ x: -4, duration: 200 }}>
												<span class="block truncate text-left">{item.label}</span>
											</span>
										{:else}
											<span class="sr-only">{item.label}</span>
										{/if}
									</a>
								</span>
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</nav>
</aside>
