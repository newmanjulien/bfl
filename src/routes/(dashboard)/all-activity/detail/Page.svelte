<script lang="ts">
	import type { AllActivityDetailQueryResult } from '../../../../convex/allActivity';
	import { List } from 'lucide-svelte';
	import DashboardDetailTabbedLayout from '$lib/dashboard/layout/DashboardDetailTabbedLayout.svelte';
	import FileUploadField from '$lib/dashboard/ui/detail/FileUploadField.svelte';
	import OrgChartSection from '$lib/dashboard/ui/detail/OrgChartSection.svelte';
	import TimelineSection from '$lib/dashboard/ui/detail/TimelineSection.svelte';
	import SectionTabPanel from '$lib/dashboard/ui/tabs/SectionTabPanel.svelte';
	import type { OrgChartNode } from '$lib/dashboard/view-models/deal-content';

	type Props = {
		data: Omit<AllActivityDetailQueryResult, 'header' | 'orgChartNodes'> & {
			orgChartRoot: OrgChartNode;
		};
	};

	let { data }: Props = $props();

	const tabs = [
		{ id: 'activity', label: 'Activity' },
		{ id: 'org-chart', label: 'Org chart' },
		{ id: 'update', label: 'Update', disabledOnMobile: true }
	] as const;
</script>

<DashboardDetailTabbedLayout hero={data.hero} icon={List} rightRailData={data.rightRail} {tabs}>
	{#snippet body()}
		<SectionTabPanel tabId="activity">
			<TimelineSection items={data.activityItems} />
		</SectionTabPanel>
		<SectionTabPanel tabId="org-chart">
			<OrgChartSection root={data.orgChartRoot} />
		</SectionTabPanel>
		<SectionTabPanel tabId="update">
			<FileUploadField data={data.update} />
		</SectionTabPanel>
	{/snippet}
</DashboardDetailTabbedLayout>
