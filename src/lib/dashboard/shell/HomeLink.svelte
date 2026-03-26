<script lang="ts">
	import { resolve } from '$app/paths';
	import { DEFAULT_DASHBOARD_ROUTE } from '$lib/dashboard/routes';

	type Props = {
		onclick?: (event: MouseEvent) => void;
		class?: string;
	};

	let { onclick, class: className = '' }: Props = $props();
</script>

<a
	href={resolve(DEFAULT_DASHBOARD_ROUTE)}
	aria-label="Go to all activity"
	class={`overflow-hidden rounded-sm ${className}`}
	{onclick}
>
	<img src="/logo.png" alt="Logo" class="size-6 shrink-0" />
</a>
