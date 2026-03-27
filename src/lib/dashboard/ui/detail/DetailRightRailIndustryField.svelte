<script lang="ts">
	import { DEAL_INDUSTRIES, type DealIndustry } from '$lib/types/vocab';
	import IndustryPicker from '$lib/dashboard/ui/pickers/IndustryPicker.svelte';

	type Props = {
		dealId: string;
		industry: DealIndustry;
		formAction?: string;
	};

	let { dealId, industry, formAction = '?/updateIndustry' }: Props = $props();
	let formElement = $state<HTMLFormElement | null>(null);
	let dealIdInput = $state<HTMLInputElement | null>(null);
	let industryInput = $state<HTMLInputElement | null>(null);

	function submitIndustrySelection(nextIndustry: DealIndustry) {
		if (nextIndustry === industry || !formElement || !industryInput || !dealIdInput) {
			return;
		}

		dealIdInput.value = dealId;
		industryInput.value = nextIndustry;
		formElement.requestSubmit();
	}
</script>

<form bind:this={formElement} method="POST" action={formAction} class="w-full">
	<input bind:this={dealIdInput} type="hidden" name="dealId" value={dealId} />
	<input bind:this={industryInput} type="hidden" name="industry" value={industry} />
	<IndustryPicker
		summary={industry}
		options={DEAL_INDUSTRIES.map((option) => ({ id: option, label: option }))}
		selectedValue={industry}
		onSelect={submitIndustrySelection}
		searchLabel="Search industries"
		searchPlaceholder="Search industries"
	/>
</form>
