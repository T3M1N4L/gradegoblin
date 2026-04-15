<script>
	import * as Select from '$lib/components/ui/select'

	export let periodDates = []
	export let selectedPeriod = 0
	export let id = 'layout-period-select'

	$: selectedValue = String(selectedPeriod)
	$: selectedItem = periodDates?.[selectedPeriod]
		? {
				value: selectedValue,
				label: periodDates[selectedPeriod].GradePeriod ?? `Mark ${selectedPeriod + 1}`
			}
		: undefined

	function handleSelectedChange(selected) {
		if (!selected) return
		if (selected.value === selectedValue) return
		window.dispatchEvent(new CustomEvent('gradegoblin:navigation-start'))
		document.cookie = `selected-period=${selected.value}; path=/; max-age=2592000; SameSite=Strict`
		window.location.assign(`${window.location.pathname}${window.location.search}${window.location.hash}`)
	}
</script>

{#if periodDates?.length}
	<div class="w-full md:w-[260px]">
		<label class="sr-only" for={id}>Select reporting period</label>
		{#key `${id}-${selectedValue}-${periodDates.length}`}
			<Select.Root selected={selectedItem} onSelectedChange={handleSelectedChange}>
				<Select.Trigger class="h-11 w-full rounded-xl border-border bg-card px-4 text-sm">
					<Select.Value placeholder="Select reporting period" />
				</Select.Trigger>
				<Select.Content class="max-h-80 rounded-xl border-border bg-card">
					<Select.Group>
						{#each periodDates as period, index}
							<Select.Item value={String(index)} label={period.GradePeriod ?? `Mark ${index + 1}`}>
								{period.GradePeriod ?? `Mark ${index + 1}`}
							</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
		{/key}
	</div>
{/if}
