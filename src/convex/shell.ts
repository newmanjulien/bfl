import { query } from './_generated/server';
import { requireMeetingScheduleDocument, toDashboardPerson } from './readModels';
import {
	dashboardShellResultValidator,
	type DashboardShellReadModel
} from './validators';

export type { DashboardShellReadModel } from './validators';

export const getDashboardShell = query({
	args: {},
	returns: dashboardShellResultValidator,
	handler: async (ctx): Promise<DashboardShellReadModel> => {
		const [meetingSchedule, brokers] = await Promise.all([
			requireMeetingScheduleDocument(ctx),
			ctx.db.query('brokers').collect()
		]);

		return {
			people: brokers.map((broker) => toDashboardPerson(broker)),
			meetingDateIsos: meetingSchedule.meetingDateIsos,
			activeMeetingDateIso: meetingSchedule.activeMeetingDateIso
		};
	}
});
