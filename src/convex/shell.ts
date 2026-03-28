import { query } from './_generated/server';
import { listMeetingRecords, toDashboardPeople } from './readModels';
import {
	dashboardShellResultValidator,
	type DashboardShellReadModel
} from './validators';

export type { DashboardShellReadModel } from './validators';

export const getDashboardShell = query({
	args: {},
	returns: dashboardShellResultValidator,
	handler: async (ctx): Promise<DashboardShellReadModel> => {
		const [meetings, brokers] = await Promise.all([
			listMeetingRecords(ctx),
			ctx.db.query('brokers').collect()
		]);

		return {
			people: await toDashboardPeople(ctx, brokers),
			meetings,
			defaultMeetingId: meetings[0]?.id ?? null
		};
	}
});
