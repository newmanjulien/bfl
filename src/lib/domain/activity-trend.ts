export type ActivityTrendPoint = {
	id: string;
	label: string;
	value: number;
};

export type ActivityTrendChartData = {
	points: readonly [ActivityTrendPoint, ActivityTrendPoint, ...ActivityTrendPoint[]];
	currentPointId: string;
};

export type ActivityTrendCurrentPoint = ActivityTrendChartData['points'][number];
