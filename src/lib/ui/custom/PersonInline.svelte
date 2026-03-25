<script lang="ts">
	import type { PersonSummary } from '$lib/domain/people';
	import { cn } from '$lib/support/cn';
	import AppAvatar from '$lib/ui/skeleton/AppAvatar.svelte';

	type Props = {
		person: PersonSummary;
		avatarSize?: number;
		truncate?: boolean;
		class?: string;
	};

	let {
		person,
		avatarSize = 20,
		truncate = false,
		class: classProp = ''
	}: Props = $props();
</script>

<span class={cn('inline-flex min-w-0 items-center gap-1.5', classProp)}>
	<AppAvatar person={person} size={avatarSize} />
	<span class={cn('leading-none text-current', truncate && 'min-w-0 truncate')}>
		{person.name}
	</span>
</span>
