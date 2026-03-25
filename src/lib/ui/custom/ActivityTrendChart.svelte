<script lang="ts">
	import { getActivityLevelTheme } from '$lib/presentation/activity-level';
	import type { ActivityLevel } from '$lib/domain/activity-level';
	import type { ActivityTrendChartData } from '$lib/domain/activity-trend';
	import {
		activityTrendLayout,
		buildActivityTrendAreaPath,
		buildActivityTrendLinePath,
		getCurrentActivityTrendPoint,
		projectActivityTrendPoints
	} from '../../charts/activity-trend';
	import { cn } from '$lib/support/cn';

	type Props = {
		chart: ActivityTrendChartData;
		activityLevel: ActivityLevel;
	};

	let { chart, activityLevel }: Props = $props();

	const theme = $derived(getActivityLevelTheme(activityLevel));
	const projectedPoints = $derived(projectActivityTrendPoints(chart, activityTrendLayout));
	const currentPoint = $derived(getCurrentActivityTrendPoint(projectedPoints, chart.currentPointId));
	const instanceId = $derived(Math.random().toString(36).slice(2, 9));
	const gridPatternId = $derived(`${instanceId}-activity-grid`);
	const areaGradientId = $derived(`${instanceId}-activity-area`);
	const linePath = $derived(buildActivityTrendLinePath(projectedPoints));
	const areaPath = $derived(buildActivityTrendAreaPath(projectedPoints, activityTrendLayout));
</script>

<svg
	viewBox={`0 0 ${activityTrendLayout.viewBox.width} ${activityTrendLayout.viewBox.height}`}
	aria-hidden="true"
	class="w-full overflow-visible"
>
	<defs>
		<pattern id={gridPatternId} width="4" height="4" patternUnits="userSpaceOnUse">
			<circle cx="1" cy="1" r="0.5" fill="#e7e5e4" />
		</pattern>
		<linearGradient id={areaGradientId} x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stop-color={theme.areaColor} stop-opacity="0.18" />
			<stop offset="100%" stop-color={theme.areaColor} stop-opacity="0.02" />
		</linearGradient>
	</defs>

	<rect
		x={activityTrendLayout.background.x}
		y={activityTrendLayout.background.y}
		width={activityTrendLayout.background.width}
		height={activityTrendLayout.background.height}
		rx="0"
		fill={`url(#${gridPatternId})`}
	/>

	<path d={areaPath} fill={`url(#${areaGradientId})`} />
	<path d={linePath} fill="none" stroke={theme.lineColor} stroke-width="1.5" />
	<circle
		cx={currentPoint.x}
		cy={currentPoint.y}
		r="6.5"
		fill="white"
		stroke={theme.currentPointStrokeColor}
		stroke-width="2"
	/>
	<circle cx={currentPoint.x} cy={currentPoint.y} r="3.5" fill={theme.currentPointFillColor} />
</svg>

<div
	class="relative h-4 text-[10px] tracking-wide text-zinc-400"
	style={`margin-left:${activityTrendLayout.labelRail.leftPercent}%;width:${activityTrendLayout.labelRail.widthPercent}%;`}
>
	{#each projectedPoints as point (point.id)}
		<span
			class={cn(
				'absolute top-0 whitespace-nowrap',
				point.labelAnchor === 'start' && 'left-0',
				point.labelAnchor === 'middle' && '-translate-x-1/2',
				point.labelAnchor === 'end' && '-translate-x-full',
				point.id === currentPoint.id && 'font-medium text-zinc-950'
			)}
			style={`left:${point.xPercent}%`}
		>
			{point.label}
		</span>
	{/each}
</div>
