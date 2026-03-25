<script lang="ts">
	import type { PersonSummary } from '$lib/domain/people';
	import { cn } from '$lib/support/cn';
	import AppAvatar from '$lib/ui/skeleton/AppAvatar.svelte';

	type Props = {
		person: PersonSummary;
		avatarSize?: number;
		class?: string;
		avatarClass?: string;
		nameClass?: string;
	};

	let {
		person,
		avatarSize = 20,
		class: className = '',
		avatarClass = '',
		nameClass = ''
	}: Props = $props();
</script>

<span class={cn('inline-flex items-center gap-1.5', className)}>
	<AppAvatar person={person} size={avatarSize} class={avatarClass} />
	<span class={cn('leading-none text-current', nameClass)}>{person.name}</span>
</span>
