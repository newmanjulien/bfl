export type ForecastQuadrantPoint = {
	id: string;
	label: string;
	x: number;
	y: number;
	description: string;
	xPx: number;
	yPx: number;
	labelOffset: number;
	labelAnchor: 'start' | 'end';
	colorClassName: string;
};

export type ForecastQuadrantPointSeed = Omit<
	ForecastQuadrantPoint,
	'xPx' | 'yPx' | 'labelOffset' | 'labelAnchor' | 'colorClassName'
>;

export type ForecastQuadrantChartMeta = {
	id: string;
	xLabel: string;
	yLabel: string;
};

export type ForecastQuadrantChartLayout = {
	dimensions: { width: number; height: number };
	plotArea: { left: number; right: number; top: number; bottom: number };
	axisLabelOffset: { x: number; y: number };
	ticks: { value: number; x: number; y: number }[];
	midLines: { x: number; y: number };
};

export type ForecastQuadrantLayoutConfig = {
	dimensions: { width: number; height: number };
	padding: { top: number; right: number; bottom: number; left: number };
	axisLabelOffset: { x: number; y: number };
	xMid: number;
	yMid: number;
	maxValue: number;
	tickCount: number;
};

export type ForecastQuadrantBehaviorConfig = {
	disagreeThreshold: number;
	labelRightEdgeThreshold: number;
};

export type ForecastQuadrantLayoutOverrides = Partial<
	Omit<ForecastQuadrantLayoutConfig, 'dimensions' | 'padding' | 'axisLabelOffset'>
> & {
	dimensions?: Partial<ForecastQuadrantLayoutConfig['dimensions']>;
	padding?: Partial<ForecastQuadrantLayoutConfig['padding']>;
	axisLabelOffset?: Partial<ForecastQuadrantLayoutConfig['axisLabelOffset']>;
};

export type ForecastQuadrantBehaviorOverrides = Partial<ForecastQuadrantBehaviorConfig>;

export type CreateForecastQuadrantChartDataOptions = {
	chart: ForecastQuadrantChartMeta;
	points: ForecastQuadrantPointSeed[];
	layout?: ForecastQuadrantLayoutOverrides;
	behavior?: ForecastQuadrantBehaviorOverrides;
};

export type ForecastQuadrantChartData = ForecastQuadrantChartMeta & {
	disagreeThreshold: number;
	layout: ForecastQuadrantChartLayout;
	points: ForecastQuadrantPoint[];
};

export const DEFAULT_FORECAST_QUADRANT_LAYOUT_CONFIG = {
	dimensions: {
		width: 720,
		height: 520
	},
	padding: {
		top: 28,
		right: 24,
		bottom: 64,
		left: 72
	},
	axisLabelOffset: {
		x: 65,
		y: 65
	},
	xMid: 50,
	yMid: 50,
	maxValue: 100,
	tickCount: 4
} satisfies ForecastQuadrantLayoutConfig;

export const DEFAULT_FORECAST_QUADRANT_BEHAVIOR_CONFIG = {
	disagreeThreshold: 6,
	labelRightEdgeThreshold: 78
} satisfies ForecastQuadrantBehaviorConfig;

export const DEFAULT_FORECAST_QUADRANT_TOOLTIP_CONFIG = {
	width: 320,
	offset: { x: 12, y: -92 },
	edgePadding: 12
} as const;

export const DEFAULT_FORECAST_QUADRANT_PAINT = {
	dotColor: '#e7e5e4',
	washStart: '#dcfce7',
	washMid: '#bbf7d0',
	washEnd: '#86efac'
} as const;

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

function coerceFiniteNumber(value: number | undefined, fallback: number): number {
	return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function linearScale(
	domainMin: number,
	domainMax: number,
	rangeMin: number,
	rangeMax: number
) {
	const span = domainMax - domainMin;
	const range = rangeMax - rangeMin;

	if (span === 0) {
		return () => rangeMin;
	}

	return (value: number) => rangeMin + ((value - domainMin) / span) * range;
}

function ticksLinear(max: number, count: number) {
	if (count <= 0) return [0, max];
	const step = max / count;

	return Array.from({ length: count + 1 }, (_, index) => Math.round(step * index));
}

function resolveLayoutConfig(
	overrides?: CreateForecastQuadrantChartDataOptions['layout']
): ForecastQuadrantLayoutConfig {
	const defaultDimensions = DEFAULT_FORECAST_QUADRANT_LAYOUT_CONFIG.dimensions;
	const defaultPadding = DEFAULT_FORECAST_QUADRANT_LAYOUT_CONFIG.padding;
	const defaultAxisLabelOffset = DEFAULT_FORECAST_QUADRANT_LAYOUT_CONFIG.axisLabelOffset;
	const dimensions = {
		width: Math.max(
			1,
			Math.round(coerceFiniteNumber(overrides?.dimensions?.width, defaultDimensions.width))
		),
		height: Math.max(
			1,
			Math.round(coerceFiniteNumber(overrides?.dimensions?.height, defaultDimensions.height))
		)
	};
	const rawPadding = {
		top: Math.max(0, coerceFiniteNumber(overrides?.padding?.top, defaultPadding.top)),
		right: Math.max(0, coerceFiniteNumber(overrides?.padding?.right, defaultPadding.right)),
		bottom: Math.max(
			0,
			coerceFiniteNumber(overrides?.padding?.bottom, defaultPadding.bottom)
		),
		left: Math.max(0, coerceFiniteNumber(overrides?.padding?.left, defaultPadding.left))
	};
	const padding = {
		left: Math.min(rawPadding.left, Math.max(0, dimensions.width - 1)),
		right: Math.min(rawPadding.right, Math.max(0, dimensions.width - rawPadding.left - 1)),
		top: Math.min(rawPadding.top, Math.max(0, dimensions.height - 1)),
		bottom: Math.min(
			rawPadding.bottom,
			Math.max(0, dimensions.height - rawPadding.top - 1)
		)
	};
	const axisLabelOffset = {
		x: Math.max(0, coerceFiniteNumber(overrides?.axisLabelOffset?.x, defaultAxisLabelOffset.x)),
		y: Math.max(0, coerceFiniteNumber(overrides?.axisLabelOffset?.y, defaultAxisLabelOffset.y))
	};
	const maxValue = Math.max(
		1,
		coerceFiniteNumber(overrides?.maxValue, DEFAULT_FORECAST_QUADRANT_LAYOUT_CONFIG.maxValue)
	);

	return {
		dimensions,
		padding,
		axisLabelOffset,
		maxValue,
		tickCount: Math.max(
			1,
			Math.round(
				coerceFiniteNumber(
					overrides?.tickCount,
					DEFAULT_FORECAST_QUADRANT_LAYOUT_CONFIG.tickCount
				)
			)
		),
		xMid: clamp(
			coerceFiniteNumber(overrides?.xMid, DEFAULT_FORECAST_QUADRANT_LAYOUT_CONFIG.xMid),
			0,
			maxValue
		),
		yMid: clamp(
			coerceFiniteNumber(overrides?.yMid, DEFAULT_FORECAST_QUADRANT_LAYOUT_CONFIG.yMid),
			0,
			maxValue
		)
	};
}

function resolveBehaviorConfig(
	overrides: CreateForecastQuadrantChartDataOptions['behavior'],
	maxValue: number
): ForecastQuadrantBehaviorConfig {
	return {
		disagreeThreshold: clamp(
			coerceFiniteNumber(
				overrides?.disagreeThreshold,
				DEFAULT_FORECAST_QUADRANT_BEHAVIOR_CONFIG.disagreeThreshold
			),
			0,
			maxValue
		),
		labelRightEdgeThreshold: clamp(
			coerceFiniteNumber(
				overrides?.labelRightEdgeThreshold,
				DEFAULT_FORECAST_QUADRANT_BEHAVIOR_CONFIG.labelRightEdgeThreshold
			),
			0,
			maxValue
		)
	};
}

function buildForecastQuadrantLayout({
	dimensions,
	padding,
	axisLabelOffset,
	xMid,
	yMid,
	maxValue,
	tickCount
}: ForecastQuadrantLayoutConfig): ForecastQuadrantChartLayout {
	const innerWidth = dimensions.width - padding.left - padding.right;
	const innerHeight = dimensions.height - padding.top - padding.bottom;

	const plotArea = {
		left: padding.left,
		right: padding.left + innerWidth,
		top: padding.top,
		bottom: padding.top + innerHeight
	};

	const xScale = linearScale(0, maxValue, plotArea.left, plotArea.right);
	const yScale = linearScale(0, maxValue, plotArea.bottom, plotArea.top);
	const ticks = ticksLinear(maxValue, tickCount);

	return {
		dimensions,
		plotArea,
		axisLabelOffset,
		ticks: ticks.map((value) => ({
			value,
			x: xScale(value),
			y: yScale(value)
		})),
		midLines: {
			x: xScale(xMid),
			y: yScale(yMid)
		}
	};
}

function normalizePointValue(value: number, maxValue: number) {
	if (!Number.isFinite(value)) {
		return 0;
	}

	return clamp(value, 0, maxValue);
}

function getForecastQuadrantPointColor(
	point: ForecastQuadrantPointSeed,
	{
		xMid,
		yMid,
		disagreeThreshold
	}: Pick<ForecastQuadrantLayoutConfig, 'xMid' | 'yMid'> &
		Pick<ForecastQuadrantBehaviorConfig, 'disagreeThreshold'>
) {
	const isRight = point.x >= xMid;
	const isTop = point.y >= yMid;
	const delta = point.y - point.x;
	const isDisagreement = Math.abs(delta) > disagreeThreshold;

	if (isDisagreement && ((isTop && isRight) || (!isTop && !isRight))) {
		return delta > 0
			? 'text-emerald-400 dark:text-emerald-300'
			: 'text-red-400 dark:text-red-300';
	}

	if (isTop && isRight) return 'text-foreground';
	if (isTop && !isRight) return 'text-emerald-600 dark:text-emerald-500';
	if (!isTop && isRight) return 'text-red-600 dark:text-red-500';
	return 'text-muted-foreground';
}

function projectForecastQuadrantPoints(
	points: ForecastQuadrantPointSeed[],
	layout: ForecastQuadrantChartLayout,
	{
		xMid,
		yMid,
		maxValue,
		disagreeThreshold,
		labelRightEdgeThreshold
	}: Pick<ForecastQuadrantLayoutConfig, 'xMid' | 'yMid' | 'maxValue'> &
		Pick<ForecastQuadrantBehaviorConfig, 'disagreeThreshold' | 'labelRightEdgeThreshold'>
): ForecastQuadrantPoint[] {
	const xScale = linearScale(0, maxValue, layout.plotArea.left, layout.plotArea.right);
	const yScale = linearScale(0, maxValue, layout.plotArea.bottom, layout.plotArea.top);

	return points.map((point) => {
		const normalizedPoint = {
			...point,
			x: normalizePointValue(point.x, maxValue),
			y: normalizePointValue(point.y, maxValue)
		};
		const isNearRightEdge = normalizedPoint.x > labelRightEdgeThreshold;

		return {
			...normalizedPoint,
			xPx: xScale(normalizedPoint.x),
			yPx: yScale(normalizedPoint.y),
			labelOffset: isNearRightEdge ? -8 : 8,
			labelAnchor: isNearRightEdge ? 'end' : 'start',
			colorClassName: getForecastQuadrantPointColor(normalizedPoint, {
				xMid,
				yMid,
				disagreeThreshold
			})
		};
	});
}

export function createForecastQuadrantChartData({
	chart,
	points,
	layout: layoutOverrides,
	behavior: behaviorOverrides
}: CreateForecastQuadrantChartDataOptions): ForecastQuadrantChartData {
	const layoutConfig = resolveLayoutConfig(layoutOverrides);
	const behaviorConfig = resolveBehaviorConfig(behaviorOverrides, layoutConfig.maxValue);
	const layout = buildForecastQuadrantLayout(layoutConfig);
	const projectedPoints = projectForecastQuadrantPoints(points, layout, {
		xMid: layoutConfig.xMid,
		yMid: layoutConfig.yMid,
		maxValue: layoutConfig.maxValue,
		disagreeThreshold: behaviorConfig.disagreeThreshold,
		labelRightEdgeThreshold: behaviorConfig.labelRightEdgeThreshold
	});

	return {
		...chart,
		disagreeThreshold: behaviorConfig.disagreeThreshold,
		layout,
		points: projectedPoints
	};
}
