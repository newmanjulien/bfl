export const DEFAULT_ALL_ACTIVITY_VIEW = 'deals' as const;
export const ALL_ACTIVITY_NON_DEFAULT_VIEWS = [
	'need-support',
	'duplicated-work',
	'unassigned',
	'likely-out-of-date'
] as const;

export type NonDefaultAllActivityView = (typeof ALL_ACTIVITY_NON_DEFAULT_VIEWS)[number];
export type AllActivityView = typeof DEFAULT_ALL_ACTIVITY_VIEW | NonDefaultAllActivityView;

export const ALL_ACTIVITY_VIEW_OPTIONS = [
	{ id: DEFAULT_ALL_ACTIVITY_VIEW, label: 'Deals' },
	{ id: 'need-support', label: 'Need support' },
	{ id: 'duplicated-work', label: 'Duplicated work' },
	{ id: 'unassigned', label: 'Unassigned' },
	{ id: 'likely-out-of-date', label: 'Likely out of date' }
] as const;

export function isNonDefaultAllActivityView(value: string): value is NonDefaultAllActivityView {
	return ALL_ACTIVITY_NON_DEFAULT_VIEWS.includes(value as NonDefaultAllActivityView);
}

export function getAllActivityViewLabel(view: AllActivityView) {
	return (
		ALL_ACTIVITY_VIEW_OPTIONS.find((option) => option.id === view)?.label ??
		ALL_ACTIVITY_VIEW_OPTIONS[0].label
	);
}
