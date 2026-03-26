<script lang="ts">
	import LinkedInGlyph from './LinkedInGlyph.svelte';
</script>

<section class="pt-1">
	<div class="rounded-md border border-dashed border-zinc-200 bg-zinc-50/35 px-4 py-5">
		<div class="flex items-start gap-3">
			<div class="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500">
				<LinkedInGlyph class="size-4 fill-current text-current" />
			</div>

			<div class="min-w-0">
				<h2 class="text-xs font-medium tracking-wide text-zinc-800">No LinkedIn updates yet</h2>
				<p class="mt-1 max-w-xl text-xs leading-relaxed tracking-wide text-zinc-500">
					This tab will fill with company posts, contact moves, and hiring updates once
					LinkedIn coverage is available for your deals.
				</p>
			</div>
		</div>
	</div>
</section>
