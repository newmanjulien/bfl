import { error } from '@sveltejs/kit';
import type { DashboardShellReadModel } from '$lib/dashboard/read-models';
import type { MeetingId } from '$lib/types/ids';

export function resolveSelectedMeetingId(
	dashboardShell: Pick<DashboardShellReadModel, 'meetings' | 'defaultMeetingId'>,
	requestedMeetingId: string | null
): MeetingId {
	if (requestedMeetingId) {
		const requestedMeeting = dashboardShell.meetings.find((meeting) => meeting.id === requestedMeetingId);

		if (requestedMeeting) {
			return requestedMeeting.id;
		}
	}

	if (!dashboardShell.defaultMeetingId) {
		throw error(503, 'No meetings available.');
	}

	return dashboardShell.defaultMeetingId;
}
