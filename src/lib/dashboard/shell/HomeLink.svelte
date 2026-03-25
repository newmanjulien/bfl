<script lang="ts">
	import { resolve } from '$app/paths';

	type Props = {
		onclick?: (event: MouseEvent) => void;
		class?: string;
	};

	let { onclick, class: className = '' }: Props = $props();
</script>

<a
	href={resolve('/since-last-meeting')}
	aria-label="Go to since last meeting"
	class={`overflow-hidden rounded-sm ${className}`}
	{onclick}
>
	<img src="/logo.png" alt="Logo" class="size-6 shrink-0" />
</a>
