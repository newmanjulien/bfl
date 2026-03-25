import { opportunitiesTiles, opportunityRiskTiles } from './projection';

export const load = () => {
	return {
		header: {
			mode: 'context',
			title: 'Opportunities & risks',
			control: 'meeting-date',
			actions: ['share', 'broker-switch'],
			extra: 'none'
		},
		hero: {
			title: 'Opportunities & risks you might help with',
			description: 'Help Julien take advantage of key opportunities and risks'
		},
		opportunityTiles: opportunitiesTiles,
		riskTiles: opportunityRiskTiles
	};
};
