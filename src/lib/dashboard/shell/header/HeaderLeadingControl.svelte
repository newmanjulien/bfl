<script lang="ts">
	import type { DashboardMeeting } from '$lib/dashboard/read-models';
	import { resolveDashboardHref } from '$lib/dashboard/routing/href';
	import type { DashboardHeaderControl } from '$lib/dashboard/shell/header/types';
	import MeetingDateMenu from '$lib/dashboard/shell/menus/MeetingDateMenu.svelte';

	const BASE_LEADING_CONTROL_CLASS =
		'dashboard-header-leading-control inline-flex items-center text-xs font-medium tracking-wide transition-colors';

	type Props = {
		control: DashboardHeaderControl;
		menuId: string;
		meetings: readonly DashboardMeeting[];
		placement?: 'bottom-start' | 'bottom-end' | 'bottom';
		class?: string;
	};

	let {
		control,
		menuId,
		meetings,
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
		route={control.route}
		{meetings}
		{placement}
		class={controlClass}
	/>
{:else}
	<a href={resolveDashboardHref(control.route)} class={controlClass}>
		{control.label}
	</a>
{/if}
