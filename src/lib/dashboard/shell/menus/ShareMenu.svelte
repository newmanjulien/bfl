<script lang="ts">
	import { Menu } from '@skeletonlabs/skeleton-svelte';
	import { Plus } from 'lucide-svelte';
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

	const selectedPeople = $derived(people.filter((person) => selectedIds.includes(person.id)));

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

<div class="mr-2 flex items-center">
	<div class="flex items-center -space-x-1">
		{#each selectedPeople as person (person.id)}
			<span class="inline-flex h-7 w-7 shrink-0 overflow-hidden rounded-full border-2 border-white">
				<img src={person.avatar} alt={person.name} class="h-full w-full object-cover" />
			</span>
		{/each}

		<Menu
			open={shellState.isMenuOpen(menuId)}
			onOpenChange={(details: { open: boolean }) => shellState.setMenuOpen(menuId, details.open)}
			positioning={{ placement: 'bottom-end', gutter: 4 }}
		>
			<Menu.Trigger
				class="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dotted border-zinc-300 bg-white text-zinc-400 ring-1 ring-white transition-colors hover:bg-zinc-100"
			>
				<Plus class="h-3 w-3" />
			</Menu.Trigger>

			<PortaledMenuPositioner>
				<Menu.Content class="min-w-56 rounded-md border border-zinc-100 bg-white p-1 shadow-sm">
					<p class="px-3 pt-3 pb-1 text-xs font-medium tracking-wide text-zinc-500">
						Share with team members
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
	</div>
</div>
