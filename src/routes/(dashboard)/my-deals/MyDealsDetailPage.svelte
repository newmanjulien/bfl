<script lang="ts">
	import { Rss } from 'lucide-svelte';
	import DashboardDetailLayout from '$lib/dashboard/layout/DashboardDetailLayout.svelte';
	import SectionTabPanel from '$lib/ui/custom/SectionTabPanel.svelte';
	import SectionTabs from '$lib/ui/custom/SectionTabs.svelte';
	import FileUploadField from '$lib/ui/skeleton/FileUploadField.svelte';
	import TimelineSection from '$lib/ui/custom/TimelineSection.svelte';
	import MyDealsNewsList from './MyDealsNewsList.svelte';

	let { data } = $props();

	const tabs = [
		{ id: 'news', label: 'News' },
		{ id: 'activity', label: 'Activity' },
		{ id: 'update', label: 'Update' }
	] as const;
</script>

<DashboardDetailLayout hero={data.hero} icon={Rss} rightRailData={data.rightRail}>
	{#snippet body()}
		<SectionTabs {tabs}>
			<SectionTabPanel tabId="news">
				<MyDealsNewsList items={data.newsItems} />
			</SectionTabPanel>
			<SectionTabPanel tabId="activity">
				<TimelineSection items={data.activityItems} />
			</SectionTabPanel>
			<SectionTabPanel tabId="update">
				<FileUploadField data={data.update} />
			</SectionTabPanel>
		</SectionTabs>
	{/snippet}
</DashboardDetailLayout>
