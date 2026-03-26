import { getOpportunityRiskTiles, getOpportunityTiles } from './projection';

export const load = () => {
	return {
		hero: {
			title: 'Opportunities & risks you might help with',
			description: 'Help Julien take advantage of key opportunities and risks'
		},
		opportunityTiles: getOpportunityTiles(),
		riskTiles: getOpportunityRiskTiles()
	};
};
