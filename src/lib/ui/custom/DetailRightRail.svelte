<script lang="ts">
	import type { DetailRightRailData, DetailRightRailRow } from '$lib/dashboard/detail-rail-model';
	import { DEAL_INDUSTRIES, type DealIndustry } from '$lib/domain/deals';
	import { formatDealNumber } from '$lib/format/deals';
	import ActivityLevelLabel from '$lib/ui/custom/ActivityLevelLabel.svelte';
	import IndustryPicker from '$lib/ui/custom/IndustryPicker.svelte';
	import PersonInline from '$lib/ui/custom/PersonInline.svelte';

	type Props = {
		data: DetailRightRailData;
	};

	let { data }: Props = $props();
	let selectedIndustries = $state<Record<string, DealIndustry>>({});

	function getSelectedIndustry(rowId: string, initialIndustry: string) {
		return selectedIndustries[rowId] ?? (initialIndustry as DealIndustry);
	}

	function updateSelectedIndustry(rowId: string, value: string) {
		selectedIndustries = {
			...selectedIndustries,
			[rowId]: value as DealIndustry
		};
	}

	function isIndustryRow(row: DetailRightRailRow) {
		return row.kind === 'text' && row.id === 'industry';
	}
</script>

<div class="w-full bg-white">
	<div class="min-w-0">
		{#each data.sections as section (section.id)}
			{#if section.kind === 'rows'}
				<section class="border-t border-zinc-100 px-4 py-4 first:border-t-0">
					<div class="grid gap-4">
						{#each section.rows as row (row.id)}
							<div class="grid items-center grid-cols-[4.25rem_minmax(0,1fr)] gap-2.5">
								<p class="self-center text-[11px] leading-relaxed tracking-wide text-zinc-400">
									{row.label}
								</p>
								<div
									class="flex min-w-0 items-center text-[11px] leading-relaxed tracking-wide text-zinc-700"
								>
									{#if row.kind === 'activity-level'}
										<ActivityLevelLabel activityLevel={row.activityLevel} />
									{:else if row.kind === 'person'}
										{#if row.person}
											<PersonInline person={row.person} avatarSize={20} class="gap-2" />
										{:else}
											<span>{row.emptyValue ?? 'Unassigned'}</span>
										{/if}
									{:else if row.kind === 'deal-number'}
										<span>{formatDealNumber(row.dealNumber)}</span>
									{:else if row.kind === 'text'}
										{#if isIndustryRow(row)}
											<IndustryPicker
												summary={getSelectedIndustry(row.id, row.value)}
												options={DEAL_INDUSTRIES.map((industry) => ({ id: industry, label: industry }))}
												selectedValue={getSelectedIndustry(row.id, row.value)}
												onSelect={(industry) => updateSelectedIndustry(row.id, industry)}
												searchLabel="Search industries"
												searchPlaceholder="Search industries"
											/>
										{:else}
											<span>{row.value}</span>
										{/if}
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</section>
			{:else if section.kind === 'helpful-contacts'}
				<section class="space-y-3 border-t border-zinc-100 px-4 py-4 first:border-t-0">
					<p class="text-[9px] uppercase tracking-[0.16em] text-zinc-400">{section.title}</p>
					<ol class="space-y-2.5">
						{#each section.contacts as contact (contact.id)}
							<li>
								<svelte:element
									this={'a'}
									href={contact.linkedInUrl}
									target="_blank"
									rel="noreferrer"
									class="block rounded-md border border-zinc-100 px-3 py-3 transition-colors hover:bg-zinc-50"
								>
									<div class="flex items-start gap-1.5">
										<svg
											viewBox="0 0 24 24"
											aria-hidden="true"
											class="mt-0.5 size-3 shrink-0 fill-current text-zinc-500"
										>
											<path d="M4.98 3.5a2.49 2.49 0 1 1 0 4.98 2.49 2.49 0 0 1 0-4.98ZM3 8.98h3.96V21H3zm6.48 0h3.8v1.64h.05c.53-1 1.82-2.05 3.75-2.05 4.01 0 4.75 2.64 4.75 6.08V21h-3.96v-5.66c0-1.35-.02-3.09-1.88-3.09-1.88 0-2.17 1.47-2.17 2.99V21H9.48z" />
										</svg>
										<div class="min-w-0">
											<h2 class="text-xs leading-snug tracking-wide text-zinc-800">
												{contact.name}
											</h2>
											<p class="mt-1 text-[11px] leading-relaxed tracking-wide text-zinc-500">
												{contact.title} at {contact.company}
											</p>
										</div>
									</div>
								</svelte:element>
							</li>
						{/each}
					</ol>
				</section>
			{/if}
		{/each}
	</div>
</div>
