import { mockDb } from '$lib/mock-db';
import {
	createForecastQuadrantChartData,
	type ForecastQuadrantChartMeta,
	type ForecastQuadrantPointSeed
} from './chart';

const forecastPointSeeds = mockDb.forecasts.list().map((forecast) => {
	const deal = mockDb.deals.requireById(forecast.dealId);

	return {
		id: deal.dealId,
		label: deal.accountName,
		x: deal.probability,
		y: forecast.overbaseProbability,
		description: forecast.description
	} satisfies ForecastQuadrantPointSeed;
});

export const QUADRANT_EXAMPLE_CHART_META = {
	id: 'example-quadrant',
	xLabel: 'Current close probability',
	yLabel: 'Overbase close probability'
} satisfies ForecastQuadrantChartMeta;

export const forecastQuadrantChart = createForecastQuadrantChartData({
	chart: QUADRANT_EXAMPLE_CHART_META,
	points: forecastPointSeeds
});
