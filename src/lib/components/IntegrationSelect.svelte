<script lang="ts">
	import { Badge } from './ui/badge';
	import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';

	interface SelectItemProps {
		value: string;
		label: string;
		color: string;
		disabled?: boolean;
	}

	interface Props {
		items: SelectItemProps[];
		value?: string[];
		onValueChange?: (value: string[]) => void;
	}

	let { items, value = $bindable([]), onValueChange }: Props = $props();

	let selectedLabel = $derived(
		value.length
			? items.filter((item) => value.includes(item.value)).map((item) => item)
			: 'Закрыта'
	);
</script>

<Select type="multiple" allowDeselect={false} bind:value {onValueChange}>
	<SelectTrigger class="flex-1">
		{#if Array.isArray(selectedLabel)}
			<div class="flex gap-1">
				{#each selectedLabel as { label, color }}
					<Badge class={color}>
						{label}
					</Badge>
				{/each}
			</div>
		{:else}
			{selectedLabel}
		{/if}
	</SelectTrigger>
	<SelectContent>
		{#each items as item}
			<SelectItem {...item} />
		{/each}
	</SelectContent>
</Select>
