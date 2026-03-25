<script lang="ts">
	import type {
		DealDetailRightRailData,
		DetailRightRailData,
		DetailRightRailLimitation
	} from '$lib/dashboard/detail-rail-model';
	import ActivityLevelLabel from '$lib/ui/custom/ActivityLevelLabel.svelte';
	import ActivityTrendChart from '$lib/ui/custom/ActivityTrendChart.svelte';
	import { formatIsoDateTimeRelative, formatIsoDateTimeRelativeMonths } from '$lib/format/date-time';
	import { formatDealNumber } from '$lib/format/deals';
	import PersonInline from '$lib/ui/custom/PersonInline.svelte';

	type Props = {
		data: DetailRightRailData;
	};

	let { data }: Props = $props();

	function getClaimedLabel(timing: DealDetailRightRailData['timing']) {
		return formatIsoDateTimeRelativeMonths(timing.claimedAtIso);
	}

	function getLastActivityLabel(timing: DealDetailRightRailData['timing']) {
		return timing.lastActivityAtIso
			? formatIsoDateTimeRelative(timing.lastActivityAtIso)
			: formatIsoDateTimeRelativeMonths(timing.claimedAtIso);
	}

	function getLimitationNote(limitation?: DetailRightRailLimitation) {
		if (limitation === 'missing-detail-context') {
			return 'Detailed deal context is unavailable for this opportunity, so the rail is limited to currently known deal metadata.';
		}

		return null;
	}

	const limitationNote = $derived(data.kind === 'metadata' ? getLimitationNote(data.limitation) : null);
</script>

<div class="w-full bg-white">
	<div class="min-w-0">
		<section class="border-t border-zinc-100 px-4 py-4 first:border-t-0">
			<div class="grid gap-4">
				<div class="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-2.5">
					<p class="text-[11px] tracking-wide text-zinc-400">Deal</p>
					<div class="min-w-0 text-[11px] leading-relaxed tracking-wide text-zinc-700">
						{data.metadata.deal}
					</div>
				</div>
				{#if data.metadata.dealNumber}
					<div class="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-2.5">
						<p class="text-[11px] tracking-wide text-zinc-400">ID</p>
						<div class="min-w-0 text-[11px] leading-relaxed tracking-wide text-zinc-700">
							{formatDealNumber(data.metadata.dealNumber)}
						</div>
					</div>
				{/if}
				<div class="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-2.5">
					<p class="text-[11px] tracking-wide text-zinc-400">Activity</p>
					<div class="min-w-0 text-[11px] leading-relaxed tracking-wide text-zinc-700">
						<ActivityLevelLabel activityLevel={data.metadata.activityLevel} />
					</div>
				</div>
				<div class="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-2.5">
					<p class="text-[11px] tracking-wide text-zinc-400">Owner</p>
					<div class="min-w-0 text-[11px] leading-relaxed tracking-wide text-zinc-700">
						{#if data.metadata.owner}
							<PersonInline person={data.metadata.owner} avatarSize={20} class="gap-2" />
						{:else}
							<span>Unassigned</span>
						{/if}
					</div>
				</div>
				<div class="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-2.5">
					<p class="text-[11px] tracking-wide text-zinc-400">Stage</p>
					<div class="min-w-0 text-[11px] leading-relaxed tracking-wide text-zinc-700">
						{data.metadata.stage}
					</div>
				</div>
			</div>
		</section>

		{#if limitationNote}
			<section class="space-y-3 border-t border-zinc-100 px-4 py-4">
				<p class="text-[9px] uppercase tracking-[0.16em] text-zinc-400">Limited detail</p>
				<p class="text-[11px] leading-relaxed tracking-wide text-zinc-700">{limitationNote}</p>
			</section>
		{/if}

		{#if data.kind === 'deal'}
			<section class="border-t border-zinc-100 px-4 py-4">
				<div class="grid gap-4">
					<div class="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-2.5">
						<p class="text-[11px] tracking-wide text-zinc-400">Claimed</p>
						<div class="min-w-0 text-[11px] leading-relaxed tracking-wide text-zinc-700">
							{getClaimedLabel(data.timing)}
						</div>
					</div>
					<div class="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-2.5">
						<p class="text-[11px] tracking-wide text-zinc-400">Last activity</p>
						<div class="min-w-0 text-[11px] leading-relaxed tracking-wide text-zinc-700">
							{getLastActivityLabel(data.timing)}
						</div>
					</div>
				</div>
			</section>

			<section class="space-y-3 border-t border-zinc-100 px-4 py-4">
				<p class="text-[9px] uppercase tracking-[0.16em] text-zinc-400">Activity level</p>
				<ActivityTrendChart chart={data.activityTrend} activityLevel={data.metadata.activityLevel} />
			</section>
		{/if}
	</div>
</div>
