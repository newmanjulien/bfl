import { opportunitiesTiles, opportunityRiskTiles } from './projection';

export const load = () => {
	return {
		hero: {
			title: 'Opportunities & risks you might help with',
			description: 'Help Julien take advantage of key opportunities and risks'
		},
		opportunityTiles: opportunitiesTiles,
		riskTiles: opportunityRiskTiles
	};
};
