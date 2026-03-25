<script lang="ts">
	import { resolve } from '$app/paths';
	import type { DashboardHeaderControl } from '$lib/dashboard/shell/dashboard-header';
	import MeetingDateMenu from '$lib/dashboard/shell/menus/MeetingDateMenu.svelte';

	const BASE_LEADING_CONTROL_CLASS =
		'dashboard-header-leading-control inline-flex items-center text-xs font-medium tracking-wide transition-colors';

	type Props = {
		control: DashboardHeaderControl;
		menuId: string;
		placement?: 'bottom-start' | 'bottom-end' | 'bottom';
		class?: string;
	};

	let { control, menuId, placement = 'bottom-start', class: classProp = '' }: Props = $props();

	const controlClass = $derived(
		classProp ? `${BASE_LEADING_CONTROL_CLASS} ${classProp}` : BASE_LEADING_CONTROL_CLASS
	);
</script>

{#if control.kind === 'meeting-date'}
	<MeetingDateMenu {menuId} {placement} class={controlClass} />
{:else}
	<a href={resolve(control.href)} class={controlClass}>
		{control.label}
	</a>
{/if}
