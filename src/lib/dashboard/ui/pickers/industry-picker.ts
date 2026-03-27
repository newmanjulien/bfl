import type { DealIndustry } from '$lib/types/vocab';

export type IndustryPickerOption = {
	id: DealIndustry;
	label: string;
};

type GetFilteredIndustryOptionsParams = {
	options: readonly IndustryPickerOption[];
	query: string;
	selectedValues?: readonly DealIndustry[];
	sortSelectedFirst?: boolean;
};

type GetInitialHighlightedIndustryIdParams = {
	options: readonly IndustryPickerOption[];
	selectedValues?: readonly DealIndustry[];
};

type GetNextHighlightedIndustryIdParams = {
	options: readonly IndustryPickerOption[];
	currentIndustryId: DealIndustry | null;
	direction: 1 | -1;
};

export function getFilteredIndustryOptions({
	options,
	query,
	selectedValues = [],
	sortSelectedFirst = false
}: GetFilteredIndustryOptionsParams) {
	const normalizedQuery = query.trim().toLocaleLowerCase();
	const filteredOptions =
		normalizedQuery.length === 0
			? [...options]
			: options.filter((option) => option.label.toLocaleLowerCase().includes(normalizedQuery));

	if (!sortSelectedFirst) {
		return filteredOptions;
	}

	return filteredOptions.sort((left, right) => {
		const leftSelected = selectedValues.includes(left.id);
		const rightSelected = selectedValues.includes(right.id);

		if (leftSelected !== rightSelected) {
			return leftSelected ? -1 : 1;
		}

		return left.label.localeCompare(right.label);
	});
}

export function getInitialHighlightedIndustryId({
	options,
	selectedValues = []
}: GetInitialHighlightedIndustryIdParams) {
	return options.find((option) => selectedValues.includes(option.id))?.id ?? options[0]?.id ?? null;
}

export function getNextHighlightedIndustryId({
	options,
	currentIndustryId,
	direction
}: GetNextHighlightedIndustryIdParams) {
	if (options.length === 0) {
		return null;
	}

	const currentIndex = currentIndustryId
		? options.findIndex((option) => option.id === currentIndustryId)
		: -1;

	if (currentIndex < 0) {
		return direction === 1 ? options[0].id : options[options.length - 1].id;
	}

	const nextIndex = (currentIndex + direction + options.length) % options.length;
	return options[nextIndex].id;
}
