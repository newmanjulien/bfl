/// <reference types="vite/client" />

export const convexTestModules = import.meta.glob([
	'./allActivity.ts',
	'./industryInternal.ts',
	'./mutations.ts',
	'./myDeals.ts',
	'./opportunities.ts',
	'./shell.ts',
	'./sinceLastMeeting.ts',
	'./_generated/*.js',
	'!./test.setup.ts',
	'!./headers.ts',
	'!./readModels.ts',
	'!./schema.ts',
	'!./validators.ts'
]);
