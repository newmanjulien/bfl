import type { ActivityTrendChartData } from '$lib/domain/activity-trend';

const ACTIVITY_TREND_LAYOUT_CONFIG = {
	dimensions: {
		width: 288,
		height: 135
	},
	backgroundInset: {
		x: 1,
		y: 1
	},
	plotArea: {
		left: 0,
		rightPadding: 12,
		top: 18,
		bottom: 118
	},
	areaBottom: 130
} as const;

type ActivityTrendLabelAnchor = 'start' | 'middle' | 'end';

export type ActivityTrendLayout = {
	viewBox: {
		width: number;
		height: number;
	};
	background: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	plotArea: {
		left: number;
		right: number;
		top: number;
		bottom: number;
	};
	areaBottom: number;
	labelRail: {
		leftPercent: number;
		widthPercent: number;
	};
};

export type ActivityTrendProjectedPoint = ActivityTrendChartData['points'][number] & {
	x: number;
	y: number;
	xPercent: number;
	labelAnchor: ActivityTrendLabelAnchor;
};

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
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

function createActivityTrendLayout(): ActivityTrendLayout {
	const { dimensions, backgroundInset, plotArea, areaBottom } = ACTIVITY_TREND_LAYOUT_CONFIG;
	const projectedPlotArea = {
		left: plotArea.left,
		right: dimensions.width - plotArea.rightPadding,
		top: plotArea.top,
		bottom: plotArea.bottom
	};
	const plotWidth = projectedPlotArea.right - projectedPlotArea.left;

	return {
		viewBox: dimensions,
		background: {
			x: backgroundInset.x,
			y: backgroundInset.y,
			width: dimensions.width - backgroundInset.x * 2,
			height: areaBottom - backgroundInset.y - 1
		},
		plotArea: projectedPlotArea,
		areaBottom,
		labelRail: {
			leftPercent: (projectedPlotArea.left / dimensions.width) * 100,
			widthPercent: (plotWidth / dimensions.width) * 100
		}
	};
}

function getLabelAnchor(index: number, pointCount: number): ActivityTrendLabelAnchor {
	if (index === 0) {
		return 'start';
	}

	if (index === pointCount - 1) {
		return 'end';
	}

	return 'middle';
}

function getPointSlope(
	previousPoint: ActivityTrendProjectedPoint,
	nextPoint: ActivityTrendProjectedPoint
) {
	const deltaX = nextPoint.x - previousPoint.x;

	if (deltaX === 0) {
		return 0;
	}

	return (nextPoint.y - previousPoint.y) / deltaX;
}

function getClampedControlPointY(
	pointY: number,
	slope: number,
	deltaX: number,
	minY: number,
	maxY: number,
	direction: 1 | -1
) {
	return clamp(pointY + direction * slope * (deltaX / 3), minY, maxY);
}

export const activityTrendLayout = createActivityTrendLayout();

export function projectActivityTrendPoints(
	chart: ActivityTrendChartData,
	layout: ActivityTrendLayout = activityTrendLayout
) {
	const { left, right, top, bottom } = layout.plotArea;
	const plotWidth = right - left;
	const xScale = linearScale(0, chart.points.length - 1, left, right);
	const yScale = linearScale(0, 100, bottom, top);

	return chart.points.map((point, index) => {
		const x = xScale(index);

		return {
			...point,
			x,
			y: yScale(clamp(point.value, 0, 100)),
			xPercent: plotWidth === 0 ? 0 : ((x - left) / plotWidth) * 100,
			labelAnchor: getLabelAnchor(index, chart.points.length)
		};
	}) satisfies ActivityTrendProjectedPoint[];
}

export function buildActivityTrendLinePath(points: readonly ActivityTrendProjectedPoint[]) {
	const [firstPoint] = points;
	let path = `M ${firstPoint.x} ${firstPoint.y}`;

	for (let index = 0; index < points.length - 1; index += 1) {
		const startPoint = points[index];
		const endPoint = points[index + 1];
		const previousPoint = points[index - 1] ?? startPoint;
		const nextPoint = points[index + 2] ?? endPoint;
		const deltaX = endPoint.x - startPoint.x;
		const minY = Math.min(startPoint.y, endPoint.y);
		const maxY = Math.max(startPoint.y, endPoint.y);
		const startSlope = getPointSlope(previousPoint, endPoint);
		const endSlope = getPointSlope(startPoint, nextPoint);
		const controlPointOneX = startPoint.x + deltaX / 3;
		const controlPointTwoX = endPoint.x - deltaX / 3;
		const controlPointOneY = getClampedControlPointY(
			startPoint.y,
			startSlope,
			deltaX,
			minY,
			maxY,
			1
		);
		const controlPointTwoY = getClampedControlPointY(
			endPoint.y,
			endSlope,
			deltaX,
			minY,
			maxY,
			-1
		);

		path += ` C ${controlPointOneX} ${controlPointOneY} ${controlPointTwoX} ${controlPointTwoY} ${endPoint.x} ${endPoint.y}`;
	}

	return path;
}

export function buildActivityTrendAreaPath(
	points: readonly ActivityTrendProjectedPoint[],
	layout: ActivityTrendLayout = activityTrendLayout
) {
	const [firstPoint] = points;
	const lastPoint = points[points.length - 1];

	return `${buildActivityTrendLinePath(points)} L ${lastPoint.x} ${layout.areaBottom} L ${firstPoint.x} ${layout.areaBottom} Z`;
}

export function getCurrentActivityTrendPoint(
	points: readonly ActivityTrendProjectedPoint[],
	currentPointId: string
) {
	return points.find((point) => point.id === currentPointId) ?? points[points.length - 1];
}
