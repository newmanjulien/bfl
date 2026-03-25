<script lang="ts">
	import { Menu } from '@skeletonlabs/skeleton-svelte';
	import { ListFilter } from 'lucide-svelte';
	import type { PersonSummary } from '$lib/domain/people';
	import { shellState } from '$lib/dashboard/state.svelte';
	import PortaledMenuPositioner from '$lib/ui/overlay/PortaledMenuPositioner.svelte';

	type Props = {
		menuId: string;
		people: PersonSummary[];
	};

	let { menuId, people }: Props = $props();

	const allPersonIds = $derived(people.map((person) => person.id));
	let selectedIds = $state<string[]>([]);

	$effect(() => {
		if (selectedIds.length === 0) {
			selectedIds = [...allPersonIds];
		}
	});

	function toggleSelectedId(selectedId: string, checked: boolean) {
		const hasId = selectedIds.includes(selectedId);

		if (checked && !hasId) {
			selectedIds = [...selectedIds, selectedId];
			return;
		}

		if (!checked && hasId) {
			selectedIds = selectedIds.filter((id) => id !== selectedId);
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
		Filter brokers
	</Menu.Trigger>

	<PortaledMenuPositioner>
		<Menu.Content class="min-w-56 rounded-md border border-zinc-100 bg-white p-1 shadow-sm">
			<p class="px-3 pt-3 pb-1 text-xs font-medium tracking-wide text-zinc-500">
				Filter by broker
			</p>

			<ul class="mt-1 space-y-1">
				{#each people as person (person.id)}
					<li>
						<Menu.OptionItem
							type="checkbox"
							value={person.id}
							checked={selectedIds.includes(person.id)}
							onCheckedChange={(checked) => toggleSelectedId(person.id, checked)}
							class="w-full rounded-md px-3 py-2 text-left text-xs text-zinc-700 transition-colors hover:bg-zinc-100"
						>
							<div class="flex items-center gap-2">
								<span
									class="inline-flex h-7 w-7 shrink-0 overflow-hidden rounded-full border border-zinc-200"
								>
									<img
										src={person.avatar}
										alt={`${person.name} avatar`}
										class="h-full w-full object-cover"
									/>
								</span>
								<Menu.ItemText>{person.name}</Menu.ItemText>
							</div>
						</Menu.OptionItem>
					</li>
				{/each}
			</ul>
		</Menu.Content>
	</PortaledMenuPositioner>
</Menu>
