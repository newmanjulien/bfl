<script lang="ts">
	import type { ForecastQuadrantChartData, ForecastQuadrantPoint } from './chart';
	import {
		DEFAULT_FORECAST_QUADRANT_PAINT,
		DEFAULT_FORECAST_QUADRANT_TOOLTIP_CONFIG
	} from './chart';

	type Props = {
		chart: ForecastQuadrantChartData;
	};

	type PointerContext = {
		x: number;
		y: number;
		width: number;
		height: number;
	};

	let { chart }: Props = $props();

	let hoveredPoint = $state<ForecastQuadrantPoint | null>(null);
	let pointerContext = $state<PointerContext | null>(null);
	let svgElement = $state<SVGSVGElement | null>(null);

	function sanitizeSvgId(value: string) {
		const normalizedValue = value
			.trim()
			.replace(/[^a-zA-Z0-9_-]+/g, '-')
			.replace(/^-+|-+$/g, '');

		return normalizedValue || 'forecast-quadrant';
	}

	const idBase = $derived(sanitizeSvgId(chart.id));
	const backgroundPatternId = $derived(`${idBase}-forecast-quadrant-background`);
	const backgroundWashId = $derived(`${idBase}-forecast-quadrant-wash`);
	const plotClipPathId = $derived(`${idBase}-forecast-quadrant-plot`);
	const dimensions = $derived(chart.layout.dimensions);
	const plotArea = $derived(chart.layout.plotArea);
	const axisLabelOffset = $derived(chart.layout.axisLabelOffset);
	const leftOverflow = $derived(Math.max(0, axisLabelOffset.x - plotArea.left + 8));
	const bottomOverflow = $derived(
		Math.max(0, plotArea.bottom + axisLabelOffset.y - dimensions.height + 8)
	);
	const plotWidth = $derived(plotArea.right - plotArea.left);
	const plotHeight = $derived(plotArea.bottom - plotArea.top);

	function getPointerContext(event: MouseEvent): PointerContext | null {
		if (!svgElement) {
			return null;
		}

		const bounds = svgElement.getBoundingClientRect();

		if (!bounds.width || !bounds.height) {
			return null;
		}

		return {
			x: event.clientX - bounds.left,
			y: event.clientY - bounds.top,
			width: bounds.width,
			height: bounds.height
		};
	}

	function clamp(value: number, min: number, max: number) {
		return Math.min(Math.max(value, min), max);
	}

	const tooltipPosition = $derived.by(() => {
		if (!pointerContext) {
			return null;
		}

		const { width, offset, edgePadding } = DEFAULT_FORECAST_QUADRANT_TOOLTIP_CONFIG;
		const maxLeft = Math.max(edgePadding, pointerContext.width - width - edgePadding);

		return {
			left: clamp(pointerContext.x + offset.x, edgePadding, maxLeft),
			top: Math.max(pointerContext.y + offset.y, edgePadding)
		};
	});
</script>

<div class="relative w-full">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<svg
		bind:this={svgElement}
		width={dimensions.width}
		height={dimensions.height}
		viewBox={`${-leftOverflow} 0 ${dimensions.width + leftOverflow} ${dimensions.height + bottomOverflow}`}
		preserveAspectRatio="xMidYMid meet"
		class="h-auto w-full text-muted-foreground"
		onmouseleave={() => {
			hoveredPoint = null;
			pointerContext = null;
		}}
	>
		<defs>
			<pattern id={backgroundPatternId} width="4" height="4" patternUnits="userSpaceOnUse">
				<circle cx="1" cy="1" r="0.5" fill={DEFAULT_FORECAST_QUADRANT_PAINT.dotColor} />
			</pattern>
			<linearGradient id={backgroundWashId} x1="0" y1="1" x2="1" y2="0">
				<stop offset="0%" stop-color={DEFAULT_FORECAST_QUADRANT_PAINT.washStart} stop-opacity="0.02" />
				<stop offset="55%" stop-color={DEFAULT_FORECAST_QUADRANT_PAINT.washMid} stop-opacity="0.05" />
				<stop offset="100%" stop-color={DEFAULT_FORECAST_QUADRANT_PAINT.washEnd} stop-opacity="0.1" />
			</linearGradient>
			<clipPath id={plotClipPathId}>
				<rect x={plotArea.left} y={plotArea.top} width={plotWidth} height={plotHeight} />
			</clipPath>
		</defs>

		<g clip-path={`url(#${plotClipPathId})`}>
			<rect
				x={plotArea.left}
				y={plotArea.top}
				width={plotWidth}
				height={plotHeight}
				fill={`url(#${backgroundPatternId})`}
			/>
			<rect
				x={plotArea.left}
				y={plotArea.top}
				width={plotWidth}
				height={plotHeight}
				fill={`url(#${backgroundWashId})`}
			/>
		</g>

		{#each chart.layout.ticks as tick (tick.value)}
			{@const isEdgeTick = tick.value === chart.layout.ticks[0]?.value || tick.value === chart.layout.ticks[chart.layout.ticks.length - 1]?.value}
			<g>
				{#if !isEdgeTick}
					<line x1={plotArea.left} x2={plotArea.right} y1={tick.y} y2={tick.y} class="stroke-border opacity-50" />
					<line x1={tick.x} x2={tick.x} y1={plotArea.top} y2={plotArea.bottom} class="stroke-border opacity-50" />
				{/if}
				<text x={plotArea.left - 12} y={tick.y + 4} text-anchor="end" class="fill-current text-[11px]">
					{tick.value}%
				</text>
				<text x={tick.x} y={plotArea.bottom + 22} text-anchor="middle" class="fill-current text-[11px]">
					{tick.value}%
				</text>
			</g>
		{/each}

		<line
			x1={chart.layout.midLines.x}
			x2={chart.layout.midLines.x}
			y1={plotArea.top}
			y2={plotArea.bottom}
			class="stroke-border [stroke-width:1.5]"
		/>
		<line
			x1={plotArea.left}
			x2={plotArea.right}
			y1={chart.layout.midLines.y}
			y2={chart.layout.midLines.y}
			class="stroke-border [stroke-width:1.5]"
		/>

		<text
			x={plotArea.left - axisLabelOffset.x}
			y={plotArea.top + (plotArea.bottom - plotArea.top) / 2}
			text-anchor="middle"
			class="fill-current text-[11px]"
			transform={`rotate(-90 ${plotArea.left - axisLabelOffset.x} ${plotArea.top + (plotArea.bottom - plotArea.top) / 2})`}
		>
			{chart.yLabel}
		</text>
		<text
			x={plotArea.left + (plotArea.right - plotArea.left) / 2}
			y={plotArea.bottom + axisLabelOffset.y}
			text-anchor="middle"
			class="fill-current text-[11px]"
		>
			{chart.xLabel}
		</text>

		{#each chart.points as point (point.id)}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<g
				onmouseenter={(event) => {
					const nextPointer = getPointerContext(event);

					if (!nextPointer) {
						return;
					}

					hoveredPoint = point;
					pointerContext = nextPointer;
				}}
				onmousemove={(event) => {
					const nextPointer = getPointerContext(event);

					if (nextPointer) {
						pointerContext = nextPointer;
					}
				}}
			>
				<circle cx={point.xPx} cy={point.yPx} r={5} class={`fill-current opacity-[0.85] ${point.colorClassName}`} />
				<text
					x={point.xPx + point.labelOffset}
					y={point.yPx + 4}
					text-anchor={point.labelAnchor}
					class="fill-current text-[10px] text-muted-foreground"
				>
					{point.label}
				</text>
			</g>
		{/each}
	</svg>

	{#if hoveredPoint && pointerContext && tooltipPosition}
		{@const delta = hoveredPoint.y - hoveredPoint.x}
		{@const absDelta = Math.abs(delta)}
		{@const body = absDelta <= chart.disagreeThreshold ? undefined : hoveredPoint.description}
		{@const gapValueClass =
			absDelta <= chart.disagreeThreshold
				? 'text-zinc-700'
				: delta > 0
					? 'text-emerald-700'
					: 'text-red-700'}
			<div
				style={`left:${tooltipPosition.left}px;top:${tooltipPosition.top}px;width:${DEFAULT_FORECAST_QUADRANT_TOOLTIP_CONFIG.width}px;`}
				class="pointer-events-none absolute rounded-md border border-zinc-100 bg-white p-3 text-xs shadow-sm"
			>
			<div class="space-y-3">
				<div class="border-b border-zinc-100 pb-2.5">
					<p class="text-[9px] uppercase tracking-[0.16em] text-zinc-400">Deal</p>
					<div class="mt-1.5 flex items-center gap-2">
						<span
							aria-hidden="true"
							class={`inline-flex size-2 shrink-0 rounded-full bg-current ${hoveredPoint.colorClassName}`}
						></span>
						<p class="min-w-0 truncate text-xs font-medium tracking-wide text-zinc-900">
							{hoveredPoint.label}
						</p>
					</div>
				</div>

				<div class="grid gap-2">
					<div class="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2.5">
						<span class="whitespace-nowrap text-[11px] tracking-wide text-zinc-400">Current</span>
						<span class="min-w-0 break-words text-[11px] leading-relaxed tracking-wide text-zinc-700">
							{hoveredPoint.x}%
						</span>
					</div>
					<div class="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2.5">
						<span class="whitespace-nowrap text-[11px] tracking-wide text-zinc-400">Overbase</span>
						<span class="min-w-0 break-words text-[11px] leading-relaxed tracking-wide text-zinc-700">
							{hoveredPoint.y}%
						</span>
					</div>
					<div class="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2.5">
						<span class="whitespace-nowrap text-[11px] tracking-wide text-zinc-400">Gap</span>
						<span class={`min-w-0 break-words text-[11px] leading-relaxed tracking-wide ${gapValueClass}`}>
							{delta >= 0 ? '+' : ''}{delta} pts
						</span>
					</div>
				</div>

				{#if body}
					<div class="border-t border-zinc-100 pt-3">
						<p class="text-[9px] uppercase tracking-[0.16em] text-zinc-400">Signal</p>
						<p class="mt-1.5 break-words text-[11px] leading-relaxed tracking-wide text-zinc-600">
							{body}
						</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
