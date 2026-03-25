<script lang="ts">
	import { resolve } from '$app/paths';
	import type { DashboardHeaderControl } from '$lib/dashboard/types';
	import { cn } from '$lib/support/cn';
	import MeetingDateMenu from '$lib/dashboard/shell/menus/MeetingDateMenu.svelte';

	type Props = {
		control: DashboardHeaderControl;
		menuId: string;
		placement?: 'bottom-start' | 'bottom-end' | 'bottom';
		className?: string;
	};

	let { control, menuId, placement = 'bottom-start', className = '' }: Props = $props();
	const controlClassName = $derived(
		cn(
			'dashboard-header-context-control inline-flex items-center text-xs font-medium tracking-wide transition-colors',
			className
		)
	);
</script>

{#if control === 'meeting-date'}
	<MeetingDateMenu {menuId} {placement} triggerClass={controlClassName} />
{:else}
	<a href={resolve(control.href)} class={controlClassName}>
		{control.label}
	</a>
{/if}
