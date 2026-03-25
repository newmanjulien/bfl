import { forecastQuadrantChart } from './projection';

export const load = () => {
	return {
		hero: {
			title: 'Forecast',
			description:
				"Compare your current close probabilities with Overbase's forecast to surface opportunities and risk"
		},
		chart: forecastQuadrantChart
	};
};
