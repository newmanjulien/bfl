<script lang="ts">
	import {
		Activity,
		CircleQuestionMark,
		LayoutGrid,
		Lightbulb,
		List,
		Rss
	} from 'lucide-svelte';
	import type { DashboardNavItem } from '$lib/dashboard/types';

	type Props = {
		icon: DashboardNavItem['icon'];
		class?: string;
	};

	let { icon, class: className = '' }: Props = $props();
</script>

{#if icon === 'activity'}
	<Activity class={className} />
{:else if icon === 'layout-grid'}
	<LayoutGrid class={className} />
{:else if icon === 'lightbulb'}
	<Lightbulb class={className} />
{:else if icon === 'list'}
	<List class={className} />
{:else if icon === 'circle-question-mark'}
	<CircleQuestionMark class={className} />
{:else}
	<Rss class={className} />
{/if}
