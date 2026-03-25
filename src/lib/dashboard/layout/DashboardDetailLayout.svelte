<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/support/cn';
	import DashboardFeedLayout from './DashboardFeedLayout.svelte';
	import {
		getDashboardDetailRailWidth,
		getDashboardLayoutMaxWidth,
		type DashboardDetailRailWidth,
		type DashboardLayoutWidth
	} from './tokens';

	type Props = {
		header: Snippet;
		width?: DashboardLayoutWidth;
		railWidth?: DashboardDetailRailWidth;
		class?: string;
		contentClass?: string;
		rightRail: Snippet;
		children?: Snippet;
	};

	let {
		header,
		width = 'normal',
		railWidth = 'standard',
		class: className = '',
		contentClass = '',
		rightRail,
		children
	}: Props = $props();

	const maxWidth = $derived(getDashboardLayoutMaxWidth(width));
	const detailRailWidth = $derived(getDashboardDetailRailWidth(railWidth));
</script>

<div
	class={cn('dashboard-detail-layout grid min-h-full grid-cols-1', className)}
	style={`--dashboard-feed-max-width: ${maxWidth}; --dashboard-detail-rail-width: ${detailRailWidth};`}
>
	<div class="min-w-0">
		<DashboardFeedLayout {header} {width} contentClass={contentClass}>
			{#if children}
				{@render children()}
			{/if}
		</DashboardFeedLayout>
	</div>

	<aside class="dashboard-detail-rail-shell w-full lg:border-l lg:border-zinc-100">
		<div class="dashboard-detail-rail-frame mx-auto w-full px-4 sm:px-6 lg:max-w-none lg:px-0">
			<div
				class="dashboard-detail-rail-surface overflow-hidden rounded-sm border border-zinc-100 bg-white lg:rounded-none lg:border-0"
			>
				{@render rightRail()}
			</div>
		</div>
	</aside>
</div>

<style>
	.dashboard-detail-layout {
		--dashboard-feed-max-width: 48rem;
		--dashboard-detail-rail-width: 22rem;
	}

	.dashboard-detail-rail-frame {
		margin-top: 1.5rem;
		max-width: var(--dashboard-feed-max-width);
	}

	@media (min-width: 1024px) {
		.dashboard-detail-layout {
			min-height: 100cqh;
			grid-template-columns: minmax(0, 1fr) var(--dashboard-detail-rail-width);
		}

		.dashboard-detail-rail-frame {
			margin-top: 0;
			height: 100%;
		}

		.dashboard-detail-rail-surface {
			position: sticky;
			top: 0;
			height: 100cqh;
			overflow-y: auto;
		}
	}
</style>
