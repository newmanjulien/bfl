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

export function getActivityLevelLabel(activityLevel: ActivityLevel) {
	return ACTIVITY_LEVEL_LABELS[activityLevel];
}

export function getActivityLevelIconVariant(activityLevel: ActivityLevel) {
	return ACTIVITY_LEVEL_ICON_VARIANTS[activityLevel];
}
