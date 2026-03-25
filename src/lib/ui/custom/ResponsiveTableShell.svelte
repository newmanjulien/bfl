<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/support/cn';

	type TableDensity = 'compact' | 'standard';
	type TableChrome = 'default' | 'subtle';

	type Props = {
		headers: readonly string[];
		columnsClass: string;
		minWidthClass: string;
		density?: TableDensity;
		chrome?: TableChrome;
		interactiveRows?: boolean;
		isEmpty?: boolean;
		body?: Snippet;
		empty?: Snippet;
		ariaLabel?: string;
		class?: string;
	};

	let {
		headers,
		columnsClass,
		minWidthClass,
		density = 'standard',
		chrome = 'default',
		interactiveRows = false,
		isEmpty = false,
		body,
		empty,
		ariaLabel,
		class: className = ''
	}: Props = $props();

	let scrollRegion: HTMLDivElement | undefined;
	let scrollInner: HTMLDivElement | undefined;

	let hasHorizontalOverflow = $state(false);
	let isScrolledToEnd = $state(true);

	const shellClass = $derived(
		cn(
			'table-shell relative rounded-sm border',
			chrome === 'default' ? 'border-zinc-100 bg-white' : 'border-zinc-200/70 bg-zinc-50/40'
		)
	);

	const headerRowClass = $derived(
		cn(
			'grid border-b',
			columnsClass,
			chrome === 'default' ? 'border-zinc-100 bg-zinc-50/80' : 'border-zinc-200/70 bg-zinc-50/55'
		)
	);

	const bodyClass = $derived(
		cn('divide-y', chrome === 'default' ? 'divide-zinc-100' : 'divide-zinc-200/70')
	);

	const showScrollHintOverlay = $derived(hasHorizontalOverflow && !isScrolledToEnd);

	function updateScrollState() {
		if (!scrollRegion) {
			hasHorizontalOverflow = false;
			isScrolledToEnd = true;
			return;
		}

		const maxScrollLeft = scrollRegion.scrollWidth - scrollRegion.clientWidth;

		hasHorizontalOverflow = maxScrollLeft > 1;
		isScrolledToEnd = !hasHorizontalOverflow || scrollRegion.scrollLeft >= maxScrollLeft - 1;
	}

	onMount(() => {
		if (!scrollRegion) {
			updateScrollState();
			return;
		}

		const onScroll = () => updateScrollState();
		const resizeObserver = new ResizeObserver(() => updateScrollState());

		scrollRegion.addEventListener('scroll', onScroll, { passive: true });
		resizeObserver.observe(scrollRegion);

		if (scrollInner) {
			resizeObserver.observe(scrollInner);
		}

		updateScrollState();

		return () => {
			scrollRegion?.removeEventListener('scroll', onScroll);
			resizeObserver.disconnect();
		};
	});
</script>

<div class={className}>
	<div
		class={shellClass}
		data-chrome={chrome}
		data-density={density}
		data-interactive-rows={interactiveRows ? 'true' : 'false'}
	>
		<div class="relative overflow-hidden rounded-sm">
			<div
				bind:this={scrollRegion}
				data-table-scroll
				class="overflow-x-auto overflow-y-hidden overscroll-x-contain"
				role={ariaLabel ? 'region' : undefined}
				aria-label={ariaLabel}
			>
				<div bind:this={scrollInner} class={cn('w-max min-w-full md:w-full', minWidthClass)}>
					<div class={headerRowClass}>
						{#each headers as header (header)}
							<span data-table-header-cell class="text-left font-normal text-zinc-500">
								{header}
							</span>
						{/each}
					</div>

					{#if isEmpty}
						<div data-table-empty class="text-zinc-500">
							{#if empty}
								{@render empty()}
							{:else}
								No rows available.
							{/if}
						</div>
					{:else if body}
						<div class={bodyClass}>
							{@render body()}
						</div>
					{/if}
				</div>
			</div>

			{#if showScrollHintOverlay}
				<div aria-hidden="true" class="table-shell__scroll-hint pointer-events-none absolute inset-y-px right-0 w-10 md:hidden"></div>
			{/if}
		</div>
	</div>
</div>

<style>
	.table-shell {
		--table-cell-px: 1rem;
		--table-cell-py: 0.75rem;
		--table-font-size: 0.75rem;
		--table-line-height: 1rem;
		--table-hover-bg: rgb(250 250 250 / 0.8);
		--table-scroll-hint-from: rgba(255, 255, 255, 0.98);
		--table-scroll-hint-to: rgba(255, 255, 255, 0);
	}

	.table-shell[data-chrome='subtle'] {
		--table-hover-bg: rgb(244 244 245 / 0.82);
		--table-scroll-hint-from: rgba(250, 250, 250, 0.98);
		--table-scroll-hint-to: rgba(250, 250, 250, 0);
	}

	.table-shell[data-density='compact'] {
		--table-cell-px: 0.875rem;
		--table-cell-py: 0.625rem;
	}

	@media (max-width: 767px) {
		.table-shell {
			--table-cell-px: 0.75rem;
			--table-cell-py: 0.625rem;
			--table-font-size: 0.6875rem;
		}

		.table-shell[data-density='compact'] {
			--table-cell-px: 0.625rem;
			--table-cell-py: 0.5rem;
		}
	}

	.table-shell :global([data-table-row]) {
		display: grid;
		align-items: center;
		transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;
	}

	.table-shell[data-interactive-rows='true'] :global([data-table-row]:hover) {
		background-color: var(--table-hover-bg);
	}

	.table-shell :global([data-table-cell]),
	.table-shell :global([data-table-header-cell]) {
		min-width: 0;
		padding: var(--table-cell-py) var(--table-cell-px);
		font-size: var(--table-font-size);
		line-height: var(--table-line-height);
		letter-spacing: 0.025em;
	}

	.table-shell :global([data-table-empty]) {
		padding: calc(var(--table-cell-py) * 2) var(--table-cell-px);
		font-size: var(--table-font-size);
		line-height: var(--table-line-height);
		letter-spacing: 0.025em;
	}

	.table-shell :global([data-table-scroll]) {
		-webkit-overflow-scrolling: touch;
	}

	.table-shell__scroll-hint {
		background: linear-gradient(
			to left,
			var(--table-scroll-hint-from),
			var(--table-scroll-hint-to)
		);
	}
</style>
