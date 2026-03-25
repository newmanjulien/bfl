<script lang="ts">
	import { FileUpload } from '@skeletonlabs/skeleton-svelte';
	import type { FileUploadFieldData } from './file-upload';

	type Props = {
		data: FileUploadFieldData;
	};

	let { data }: Props = $props();

	let files = $state<File[]>([]);
	const allowMultipleFiles = $derived(data.allowMultipleFiles ?? true);
	const selectionSummary = $derived.by(() => {
		if (files.length === 0) {
			return allowMultipleFiles ? 'No files selected' : 'No file chosen';
		}

		if (files.length === 1) {
			return files[0].name;
		}

		return `${files.length} files selected`;
	});
</script>

<section class="rounded-md border border-zinc-100 bg-white px-3 py-3">
	<FileUpload
		name={`${data.sectionId}-upload`}
		maxFiles={allowMultipleFiles ? 20 : 1}
		onFileChange={(details: { acceptedFiles: File[] }) => {
			files = details.acceptedFiles;
		}}
	>
		<div class="space-y-1">
			<FileUpload.Label class="text-xs font-medium tracking-wide text-zinc-900">
				{data.uploadLabel ?? 'Upload files'}
			</FileUpload.Label>
			{#if data.uploadDescription}
				<p class="text-xs leading-relaxed tracking-wide text-zinc-500">
					{data.uploadDescription}
				</p>
			{/if}
		</div>

		<FileUpload.HiddenInput
			accept={data.acceptedFileTypes}
			multiple={allowMultipleFiles}
		/>

		<FileUpload.Dropzone
			class="mt-3 rounded-md border border-dashed border-zinc-200 bg-zinc-50/35 px-4 py-4 text-xs leading-relaxed tracking-wide text-zinc-600 transition-colors data-[dragging]:border-zinc-300 data-[dragging]:bg-zinc-50"
		>
			<div class="flex w-full flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div class="min-w-0">
					<p class="text-xs font-medium tracking-wide text-zinc-700">Select files or drop them here</p>
					<p class="mt-1 truncate text-xs leading-relaxed tracking-wide text-zinc-500">
						{selectionSummary}
					</p>
				</div>
				<FileUpload.Trigger class="upload-browse-trigger mr-0 flex h-7 shrink-0 items-center justify-center rounded-sm border border-zinc-100 px-2 text-xs font-medium tracking-wide text-zinc-500 transition-colors hover:bg-zinc-100">
					Browse
				</FileUpload.Trigger>
			</div>
		</FileUpload.Dropzone>

	</FileUpload>
</section>
