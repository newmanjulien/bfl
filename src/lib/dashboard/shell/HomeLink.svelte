<script lang="ts">
	import { DEFAULT_DASHBOARD_ROUTE_REF } from '$lib/dashboard/routing';
	import { resolveDashboardHref } from '$lib/dashboard/routing/href';

	type Props = {
		onclick?: (event: MouseEvent) => void;
		class?: string;
	};

	let { onclick, class: className = '' }: Props = $props();
</script>

<a
	href={resolveDashboardHref(DEFAULT_DASHBOARD_ROUTE_REF)}
	aria-label="Go to all activity"
	class={`overflow-hidden rounded-sm ${className}`}
	{onclick}
>
	<img src="/logo.png" alt="Logo" class="size-6 shrink-0" />
</a>
