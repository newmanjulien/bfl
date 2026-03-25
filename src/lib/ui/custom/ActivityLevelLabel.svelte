<script lang="ts">
	import {
		getActivityLevelIconVariant,
		getActivityLevelLabel
	} from '$lib/presentation/activity-level';
	import type { ActivityLevel } from '$lib/domain/activity-level';
	import ActivityLevelGridIcon from '$lib/ui/custom/ActivityLevelGridIcon.svelte';
	import InlinePill from '$lib/ui/custom/InlinePill.svelte';

	type Props = {
		activityLevel: ActivityLevel;
		class?: string;
	};

	let { activityLevel, class: className = '' }: Props = $props();
</script>

<InlinePill class={className}>
	{#snippet icon()}
		<ActivityLevelGridIcon
			variant={getActivityLevelIconVariant(activityLevel)}
			class="size-2.5 text-zinc-400"
		/>
	{/snippet}
	{getActivityLevelLabel(activityLevel)}
</InlinePill>
