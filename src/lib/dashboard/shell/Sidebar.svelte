<script lang="ts">
	import { resolve } from '$app/paths';
	import { ChevronsUpDown } from 'lucide-svelte';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { fly } from 'svelte/transition';
	import { DASHBOARD_NAV_GROUP_ORDER, DASHBOARD_NAV_GROUPS } from '$lib/dashboard/config';
	import { getActiveDashboardRoute, type DashboardStaticHref } from '$lib/dashboard/routes';
	import type { DashboardNavGroupId, DashboardRouteNavItem } from '$lib/dashboard/types';
	import { shellState } from '$lib/dashboard/state.svelte';
	import { cn } from '$lib/support/cn';
	import HomeLink from './HomeLink.svelte';
	import NavIcon from './NavIcon.svelte';
	import { DASHBOARD_NAV_PRESENTATION } from './nav-presentation';

	type Props = {
		class?: string;
	};

	let { class: className = '' }: Props = $props();

	const activeRoute = $derived(getActiveDashboardRoute(page.url.pathname));
	let hoveredHref = $state<DashboardStaticHref | null>(null);
	let navElement = $state<HTMLElement | null>(null);

	const itemElements = new SvelteMap<DashboardStaticHref, HTMLSpanElement>();
	const bottomRouteHrefs = new Set(
		DASHBOARD_NAV_GROUPS.bottom
			.filter((item): item is DashboardRouteNavItem => item.kind === 'route')
			.map((item) => item.href)
	);

	let resizeObserver: ResizeObserver | null = null;
	let indicatorFrame = 0;

	function clearIndicator() {
		if (!navElement) return;
		navElement.style.setProperty('--sidebar-nav-indicator-opacity', '0');
	}

	function updateIndicator() {
		if (!navElement) return;

		const targetHref = hoveredHref ?? activeRoute;
		if (!targetHref || bottomRouteHrefs.has(targetHref)) {
			clearIndicator();
			return;
		}

		const targetElement = itemElements.get(targetHref);
		if (!targetElement) {
			clearIndicator();
			return;
		}

		const navRect = navElement.getBoundingClientRect();
		const targetRect = targetElement.getBoundingClientRect();

		navElement.style.setProperty('--sidebar-nav-indicator-top', `${targetRect.top - navRect.top}px`);
		navElement.style.setProperty(
			'--sidebar-nav-indicator-left',
			`${targetRect.left - navRect.left}px`
		);
		navElement.style.setProperty('--sidebar-nav-indicator-width', `${targetRect.width}px`);
		navElement.style.setProperty('--sidebar-nav-indicator-height', `${targetRect.height}px`);
		navElement.style.setProperty('--sidebar-nav-indicator-opacity', '1');
	}

	function scheduleIndicatorUpdate() {
		if (typeof window === 'undefined') return;
		cancelAnimationFrame(indicatorFrame);
		indicatorFrame = window.requestAnimationFrame(() => {
			updateIndicator();
		});
	}

	function observeItem(node: HTMLSpanElement) {
		resizeObserver?.observe(node);
	}

	function unobserveItem(node: HTMLSpanElement) {
		resizeObserver?.unobserve(node);
	}

	function trackIndicatorTarget(node: HTMLSpanElement, href: DashboardStaticHref) {
		let currentHref = href;

		itemElements.set(currentHref, node);
		observeItem(node);
		scheduleIndicatorUpdate();

		return {
			update(nextHref: DashboardStaticHref) {
				if (nextHref === currentHref) return;
				itemElements.delete(currentHref);
				currentHref = nextHref;
				itemElements.set(currentHref, node);
				scheduleIndicatorUpdate();
			},
			destroy() {
				if (itemElements.get(currentHref) === node) {
					itemElements.delete(currentHref);
				}
				unobserveItem(node);
				scheduleIndicatorUpdate();
			}
		};
	}

	function isBottomGroup(groupId: DashboardNavGroupId) {
		return groupId === 'bottom';
	}

	function shouldShowCollapsedDivider(groupId: DashboardNavGroupId) {
		if (shellState.isSidebarExpanded) return false;

		if (groupId === 'managers') {
			return (
				DASHBOARD_NAV_GROUPS.brokers.length > 0 &&
				DASHBOARD_NAV_GROUPS.managers.length > 0 &&
				!!DASHBOARD_NAV_PRESENTATION.managers.showCollapsedDivider
			);
		}

		if (groupId === 'leadership') {
			return (
				DASHBOARD_NAV_GROUPS.managers.length > 0 &&
				DASHBOARD_NAV_GROUPS.leadership.length > 0 &&
				!!DASHBOARD_NAV_PRESENTATION.leadership.showCollapsedDivider
			);
		}

		return false;
	}

	function getContainerClassName(groupId: DashboardNavGroupId) {
		return cn(
			'relative',
			shellState.isSidebarExpanded ? 'block w-full' : 'inline-flex',
			isBottomGroup(groupId) && !shellState.isSidebarExpanded && 'self-center'
		);
	}

	function getItemClassName(params: {
		groupId: DashboardNavGroupId;
		isActive: boolean;
		disabled?: boolean;
	}) {
		const { groupId, isActive, disabled = false } = params;
		const isBottom = isBottomGroup(groupId);

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

	onMount(() => {
		resizeObserver = new ResizeObserver(() => {
			scheduleIndicatorUpdate();
		});

		if (navElement) {
			resizeObserver.observe(navElement);
		}

		for (const itemElement of itemElements.values()) {
			resizeObserver.observe(itemElement);
		}

		scheduleIndicatorUpdate();

		return () => {
			cancelAnimationFrame(indicatorFrame);
			resizeObserver?.disconnect();
		};
	});

	$effect(() => {
		const targetHref = hoveredHref ?? activeRoute;
		const isExpanded = shellState.isSidebarExpanded;
		const hasNav = !!navElement;

		if (!hasNav && !targetHref && !isExpanded) {
			return;
		}

		scheduleIndicatorUpdate();
	});
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
		bind:this={navElement}
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
		{#each DASHBOARD_NAV_GROUP_ORDER as groupId (groupId)}
			{@const presentation = DASHBOARD_NAV_PRESENTATION[groupId]}
			<div
				class={cn(
					'flex flex-col',
					(groupId === 'bottom' || shellState.isSidebarExpanded) &&
						presentation.desktopSectionClassName,
					groupId === 'bottom' && 'mt-auto pb-1'
				)}
			>
				{#if presentation.heading && shellState.isSidebarExpanded}
					<div class="mb-2" in:fly={{ x: -4, duration: 200 }}>
						<p class="px-2 text-[11px] uppercase tracking-wide text-zinc-400">
							{presentation.heading}
						</p>
					</div>
				{:else if shouldShowCollapsedDivider(groupId)}
					<div class="py-3">
						<span aria-hidden="true" class="mx-auto block h-px w-4 bg-zinc-200/50"></span>
					</div>
				{/if}

				<ul class="flex flex-col gap-1.5">
					{#each DASHBOARD_NAV_GROUPS[groupId] as item (item.kind === 'route' ? item.href : `${groupId}:${item.label}`)}
						<li>
							{#if item.kind === 'disabled'}
								<span class={getContainerClassName(groupId)}>
									<span class={getItemClassName({ groupId, isActive: false, disabled: true })}>
										<NavIcon icon={item.icon} class="size-3.5 shrink-0" />
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
								<span
									use:trackIndicatorTarget={item.href}
									class={getContainerClassName(groupId)}
								>
									<a
										href={resolve(item.href)}
										class={getItemClassName({
											groupId,
											isActive: activeRoute === item.href
										})}
										onmouseenter={() => {
											if (!isBottomGroup(groupId)) {
												hoveredHref = item.href;
											}
										}}
									>
										<NavIcon icon={item.icon} class="size-3.5 shrink-0" />
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
