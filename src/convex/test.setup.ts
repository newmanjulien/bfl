/// <reference types="vite/client" />

export const convexTestModules = import.meta.glob([
	'./industryInternal.ts',
	'./mutations.ts',
	'./myDeals.ts',
	'./newBusiness.ts',
	'./opportunities.ts',
	'./shell.ts',
	'./sinceLastMeeting.ts',
	'./_generated/*.js',
	'!./test.setup.ts',
	'!./readModels.ts',
	'!./schema.ts',
	'!./validators.ts'
]);
