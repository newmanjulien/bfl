import type { FileUploadFieldData } from '$lib/ui/skeleton/file-upload';
import { formatIsoDateMonthDayLong } from '$lib/format/date-time';
import {
	sinceLastMeetingReferenceIso,
	sinceLastMeetingDeals,
	sinceLastMeetingTimelineItems
} from './projection';

export const load = () => {
	const update: FileUploadFieldData = {
		sectionId: 'update',
		uploadLabel: 'Upload files',
		uploadDescription: "Upload screenshots or any docs with the information we're missing"
	};

	return {
		hero: {
			title: 'Since your last meeting with Julien',
			description:
				`Get a quick overview of what progress Julien has made since your last meeting on ${formatIsoDateMonthDayLong(sinceLastMeetingReferenceIso)}`
		},
		timelineItems: sinceLastMeetingTimelineItems,
		deals: sinceLastMeetingDeals,
		update
	};
};
