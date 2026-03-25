import type { IsoDateString } from '$lib/domain/date-time';
import type { PersonSummary } from '$lib/domain/people';

export type TimelineMarker =
	| {
			kind: 'dot';
	  }
	| {
			kind: 'avatar';
			person: PersonSummary;
	  };

type TimelineItemBase = {
	id: string;
	occurredOnIso: IsoDateString;
	body: string;
	marker: TimelineMarker;
};

export type TimelineItem =
	| (TimelineItemBase & {
			kind: 'headline';
			title: string;
	  })
	| (TimelineItemBase & {
			kind: 'actor-action';
			actor: PersonSummary;
			action: string;
	  });

export type OrgChartNode = {
	id: string;
	name: string;
	role: string;
	lastContacted: {
		by: string;
		on: string;
	};
	directReports?: OrgChartNode[];
};

export type NewsSource = 'news' | 'linkedin';
