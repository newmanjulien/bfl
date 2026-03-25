<script lang="ts">
	import { getDashboardLayoutMaxWidth } from '$lib/dashboard/layout/tokens';
	import CanvasHero from '$lib/ui/custom/CanvasHero.svelte';
	import DealSummaryTableSection from '$lib/ui/custom/DealSummaryTableSection.svelte';
	import SectionTabPanel from '$lib/ui/custom/SectionTabPanel.svelte';
	import SectionTabs from '$lib/ui/custom/SectionTabs.svelte';
	import FileUploadField from '$lib/ui/skeleton/FileUploadField.svelte';
	import TimelineSection from '$lib/ui/custom/TimelineSection.svelte';

	let { data } = $props();

	const tabs = [
		{ id: 'timeline', label: 'Timeline' },
		{ id: 'deals', label: 'Deals' },
		{ id: 'update', label: 'Update' }
	] as const;

	const maxWidth = getDashboardLayoutMaxWidth('normal');
</script>

<div class="relative mx-auto w-full" style={`max-width: ${maxWidth};`}>
		<div class="px-4 pt-8 pb-6 sm:px-6 lg:px-8">
			<CanvasHero hero={data.hero} />
			<SectionTabs {tabs}>
				<SectionTabPanel tabId="timeline">
					<TimelineSection items={data.timelineItems} />
				</SectionTabPanel>
				<SectionTabPanel tabId="deals">
					<DealSummaryTableSection rows={data.deals} />
				</SectionTabPanel>
				<SectionTabPanel tabId="update">
					<FileUploadField data={data.update} />
				</SectionTabPanel>
			</SectionTabs>
		</div>
	</div>
