<script lang="ts">
	import { Menu } from '@skeletonlabs/skeleton-svelte';
	import { ListFilter } from 'lucide-svelte';
	import {
		getActivityLevelIconVariant,
		getActivityLevelLabel
	} from '$lib/presentation/activity-level';
	import { ACTIVITY_LEVELS, type ActivityLevel } from '$lib/domain/activity-level';
	import { shellState } from '$lib/dashboard/state.svelte';
	import ActivityLevelGridIcon from '$lib/ui/custom/ActivityLevelGridIcon.svelte';
	import PortaledMenuPositioner from '$lib/ui/overlay/PortaledMenuPositioner.svelte';

	type Props = {
		menuId: string;
	};

	let { menuId }: Props = $props();
	let selectedLevels = $state<ActivityLevel[]>([...ACTIVITY_LEVELS]);

	function toggleSelectedLevel(selectedLevel: ActivityLevel, checked: boolean) {
		const hasLevel = selectedLevels.includes(selectedLevel);

		if (checked && !hasLevel) {
			selectedLevels = [...selectedLevels, selectedLevel];
			return;
		}

		if (!checked && hasLevel) {
			selectedLevels = selectedLevels.filter((level) => level !== selectedLevel);
		}
	}
</script>

<Menu
	open={shellState.isMenuOpen(menuId)}
	onOpenChange={(details: { open: boolean }) => shellState.setMenuOpen(menuId, details.open)}
	positioning={{ placement: 'bottom-end', gutter: 4 }}
>
	<Menu.Trigger class="flex h-7 items-center justify-center gap-1.5 rounded-sm border border-zinc-100 px-2 text-xs font-medium tracking-wide text-zinc-500 transition-colors hover:bg-zinc-100">
		<ListFilter class="size-3.5" />
		Filter activity level
	</Menu.Trigger>

	<PortaledMenuPositioner>
		<Menu.Content class="min-w-56 rounded-md border border-zinc-100 bg-white p-1 shadow-sm">
			<p class="px-3 pt-3 pb-1 text-xs font-medium tracking-wide text-zinc-500">
				Filter by activity level
			</p>

			<ul class="mt-1 space-y-1">
				{#each ACTIVITY_LEVELS as activityLevel (activityLevel)}
					<li>
						<Menu.OptionItem
							type="checkbox"
							value={activityLevel}
							checked={selectedLevels.includes(activityLevel)}
							onCheckedChange={(checked) => toggleSelectedLevel(activityLevel, checked)}
							class="w-full rounded-md px-3 py-2 text-left text-xs text-zinc-700 transition-colors hover:bg-zinc-100"
						>
							<div class="flex items-center gap-2">
								<ActivityLevelGridIcon
									variant={getActivityLevelIconVariant(activityLevel)}
									class="size-3 text-zinc-400"
								/>
								<Menu.ItemText>{getActivityLevelLabel(activityLevel)}</Menu.ItemText>
							</div>
						</Menu.OptionItem>
					</li>
				{/each}
			</ul>
		</Menu.Content>
	</PortaledMenuPositioner>
</Menu>
