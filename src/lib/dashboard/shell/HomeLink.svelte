<script lang="ts">
	import { resolve } from '$app/paths';
	import { DEFAULT_DASHBOARD_ROUTE_REF, resolveDashboardRoute } from '$lib/dashboard/routing';

	type Props = {
		onclick?: (event: MouseEvent) => void;
		class?: string;
	};

	let { onclick, class: className = '' }: Props = $props();
</script>

<a
	href={resolve(resolveDashboardRoute(DEFAULT_DASHBOARD_ROUTE_REF))}
	aria-label="Go to all activity"
	class={`overflow-hidden rounded-sm ${className}`}
	{onclick}
>
	<img src="/logo.png" alt="Logo" class="size-6 shrink-0" />
</a>
