import type {
	ActivityTrendChartData,
	ActivityTrendCurrentPoint
} from '$lib/domain/activity-trend';

export const ACTIVITY_LEVELS = ['high', 'medium', 'low'] as const;

export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];

function clampActivityScore(score: number) {
	return Math.min(Math.max(score, 0), 100);
}

export function getCurrentActivityTrendPoint(
	activityTrend: ActivityTrendChartData
): ActivityTrendCurrentPoint {
	return (
		activityTrend.points.find((point) => point.id === activityTrend.currentPointId) ??
		activityTrend.points[activityTrend.points.length - 1]
	);
}

export function getCurrentActivityTrendScore(activityTrend: ActivityTrendChartData) {
	return clampActivityScore(getCurrentActivityTrendPoint(activityTrend).value);
}

export function getActivityLevelFromScore(score: number): ActivityLevel {
	const normalizedScore = clampActivityScore(score);

	if (normalizedScore >= 67) return 'high';
	if (normalizedScore >= 34) return 'medium';
	return 'low';
}

export function getActivityLevelFromTrend(activityTrend: ActivityTrendChartData) {
	return getActivityLevelFromScore(getCurrentActivityTrendScore(activityTrend));
}
