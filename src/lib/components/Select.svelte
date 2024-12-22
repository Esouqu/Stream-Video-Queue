<script lang="ts">
	import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';

	interface SelectItemProps {
		value: string;
		label: string;
		disabled?: boolean;
	}

	interface Props {
		items: SelectItemProps[];
		value?: string;
		class?: string;
		onValueChange?: (value: string) => void;
	}

	let { items, value = $bindable(items[0].value), class: className }: Props = $props();

	const selectedLabel = $derived(
		value ? items.find((theme) => theme.value === value)?.label : 'Выберите опцию'
	);
</script>

<Select type="single" allowDeselect={false} bind:value>
	<SelectTrigger class={className}>{selectedLabel}</SelectTrigger>
	<SelectContent>
		{#each items as item}
			<SelectItem {...item} />
		{/each}
	</SelectContent>
</Select>
