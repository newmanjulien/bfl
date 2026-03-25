import type { ActivityLevel } from '$lib/domain/activity-level';
import type { PersonSummary } from '$lib/domain/people';

export type DetailRightRailRow =
	| {
			id: string;
			label: string;
			kind: 'text';
			value: string;
	  }
	| {
			id: string;
			label: string;
			kind: 'deal-number';
			dealNumber: number;
	  }
	| {
			id: string;
			label: string;
			kind: 'activity-level';
			activityLevel: ActivityLevel;
	  }
	| {
			id: string;
			label: string;
			kind: 'person';
			person: PersonSummary | null;
			emptyValue?: string;
	  };

export type DetailRightRailHelpfulContact = {
	id: string;
	name: string;
	title: string;
	company: string;
	linkedInUrl: string;
};

export type DetailRightRailSection =
	| {
			id: string;
			kind: 'rows';
			rows: readonly DetailRightRailRow[];
	  }
	| {
			id: string;
			kind: 'helpful-contacts';
			title: string;
			contacts: readonly DetailRightRailHelpfulContact[];
	  };

export type DetailRightRailData = {
	sections: readonly DetailRightRailSection[];
};
