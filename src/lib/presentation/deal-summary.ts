import type { ActivityLevel } from '$lib/domain/activity-level';

export type DealSummaryRow = {
	id: string;
	deal: string;
	probability: number;
	activityLevel: ActivityLevel;
	stage: string;
};
