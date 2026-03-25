export const ACTIVITY_LEVELS = ['high', 'medium', 'low'] as const;

export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];
