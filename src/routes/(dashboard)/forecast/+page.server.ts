import { forecastQuadrantChart } from './projection';

export const load = () => {
	return {
		header: {
			mode: 'context',
			title: 'Forecast',
			control: 'meeting-date',
			actions: ['share', 'broker-switch'],
			extra: 'none'
		},
		hero: {
			title: 'Forecast',
			description:
				"Compare your current close probabilities with Overbase's forecast to surface opportunities and risk"
		},
		chart: forecastQuadrantChart
	};
};
