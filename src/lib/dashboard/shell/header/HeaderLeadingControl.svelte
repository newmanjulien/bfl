<script lang="ts">
	import { resolve } from '$app/paths';
	import { resolveDashboardRoute } from '$lib/dashboard/routing';
	import type { DashboardHeaderControl } from '$lib/dashboard/shell/header/types';
	import type { IsoDate } from '$lib/types/dates';
	import MeetingDateMenu from '$lib/dashboard/shell/menus/MeetingDateMenu.svelte';

	const BASE_LEADING_CONTROL_CLASS =
		'dashboard-header-leading-control inline-flex items-center text-xs font-medium tracking-wide transition-colors';

	type Props = {
		control: DashboardHeaderControl;
		menuId: string;
		meetingDateIsos: readonly IsoDate[];
		activeMeetingDateIso?: IsoDate | null;
		placement?: 'bottom-start' | 'bottom-end' | 'bottom';
		class?: string;
	};

	let {
		control,
		menuId,
		meetingDateIsos,
		activeMeetingDateIso = null,
		placement = 'bottom-start',
		class: classProp = ''
	}: Props = $props();

	const controlClass = $derived(
		classProp ? `${BASE_LEADING_CONTROL_CLASS} ${classProp}` : BASE_LEADING_CONTROL_CLASS
	);
</script>

{#if control.kind === 'meeting-date'}
	<MeetingDateMenu
		{menuId}
		{meetingDateIsos}
		{activeMeetingDateIso}
		{placement}
		class={controlClass}
	/>
{:else}
	<a href={resolve(resolveDashboardRoute(control.route))} class={controlClass}>
		{control.label}
	</a>
{/if}
