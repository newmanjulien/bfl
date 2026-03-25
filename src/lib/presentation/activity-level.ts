import type { ActivityLevel } from '$lib/domain/activity-level';

export type ActivityLevelIconVariant = 'full-grid' | 'half-grid' | 'quarter-grid';

const ACTIVITY_LEVEL_LABELS = {
	high: 'High activity',
	medium: 'Medium activity',
	low: 'Low activity'
} as const satisfies Record<ActivityLevel, string>;

const ACTIVITY_LEVEL_ICON_VARIANTS = {
	high: 'full-grid',
	medium: 'half-grid',
	low: 'quarter-grid'
} as const satisfies Record<ActivityLevel, ActivityLevelIconVariant>;

const ACTIVITY_LEVEL_THEMES = {
	high: {
		lineColor: '#86efac',
		areaColor: '#86efac',
		currentPointFillColor: '#4ade80',
		currentPointStrokeColor: '#f0fdf4'
	},
	medium: {
		lineColor: '#fde047',
		areaColor: '#fde047',
		currentPointFillColor: '#facc15',
		currentPointStrokeColor: '#fefce8'
	},
	low: {
		lineColor: '#fca5a5',
		areaColor: '#fca5a5',
		currentPointFillColor: '#f87171',
		currentPointStrokeColor: '#fef2f2'
	}
} as const;

export function getActivityLevelLabel(activityLevel: ActivityLevel) {
	return ACTIVITY_LEVEL_LABELS[activityLevel];
}

export function getActivityLevelIconVariant(activityLevel: ActivityLevel) {
	return ACTIVITY_LEVEL_ICON_VARIANTS[activityLevel];
}

export function getActivityLevelTheme(activityLevel: ActivityLevel) {
	return ACTIVITY_LEVEL_THEMES[activityLevel];
}
