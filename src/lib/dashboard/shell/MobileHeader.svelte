<script lang="ts">
	import { Menu } from 'lucide-svelte';
	import type { DashboardHeader } from '$lib/dashboard/types';
	import { shellState } from '$lib/dashboard/state.svelte';
	import HeaderContextControl from './HeaderContextControl.svelte';
	import HomeLink from './HomeLink.svelte';

	type Props = {
		header: DashboardHeader | null | undefined;
	};

	let { header }: Props = $props();
	const contextControlClassName =
		'!mr-0 !ml-0 h-8 min-w-0 max-w-full justify-center rounded-sm px-2 text-center hover:bg-zinc-100 hover:text-zinc-900';
</script>

<header class="flex h-11 items-center border-b border-zinc-100 bg-white px-(--shell-gutter-mobile) md:hidden">
	<div class="flex w-12 items-center">
		<HomeLink />
	</div>
	<div class="min-w-0 flex-1 px-2 text-center">
		{#if header}
			{#if header.mode === 'context'}
				{#if header.control}
					<div class="flex justify-center">
						<HeaderContextControl
							control={header.control}
							menuId="mobile-header-context-control"
							placement="bottom"
							className={contextControlClassName}
						/>
					</div>
				{/if}
			{:else}
				<span class="block truncate text-xs font-medium tracking-wide text-zinc-600">
					{header.title}
				</span>
			{/if}
		{/if}
	</div>
	<div class="flex w-12 justify-end">
		<button
			type="button"
			aria-label="Toggle navigation menu"
			class="inline-flex size-8 items-center justify-center rounded-sm text-zinc-700 transition-colors hover:bg-zinc-100"
			onclick={() => shellState.toggleMobileDrawer()}
		>
			<Menu class="size-4" />
		</button>
	</div>
</header>
