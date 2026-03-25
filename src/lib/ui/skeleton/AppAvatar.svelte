<script lang="ts">
	import { Avatar } from '@skeletonlabs/skeleton-svelte';
	import type { PersonSummary } from '$lib/domain/people';
	import { cn } from '$lib/support/cn';

	type Props = {
		person: Pick<PersonSummary, 'name' | 'avatar'>;
		size?: number;
		class?: string;
		imageClass?: string;
	};

	let { person, size = 20, class: className = '', imageClass = '' }: Props = $props();
</script>

<Avatar class={cn('inline-flex shrink-0 overflow-hidden rounded-full', className)} style={`width:${size}px;height:${size}px;`}>
	<Avatar.Image
		src={person.avatar}
		alt={`${person.name} avatar`}
		class={cn('block h-full w-full object-cover', imageClass)}
	/>
	<Avatar.Fallback class="flex h-full w-full items-center justify-center bg-zinc-100 text-[10px] font-medium text-zinc-500">
		{person.name.slice(0, 1)}
	</Avatar.Fallback>
</Avatar>
