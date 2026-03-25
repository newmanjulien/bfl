import { getContext, setContext } from 'svelte';

const SECTION_TABS_CONTEXT_KEY = Symbol('section-tabs');

export type SectionTabsContext = {
	matches(tabId: string): boolean;
};

export function provideSectionTabsContext(context: SectionTabsContext) {
	return setContext(SECTION_TABS_CONTEXT_KEY, context);
}

export function useSectionTabsContext() {
	return getContext<SectionTabsContext>(SECTION_TABS_CONTEXT_KEY);
}
