<script lang="ts">
	import { Badge } from './ui/badge';
	import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';

	interface Props {
		items: { label: string; value: string; disabled?: boolean }[];
		value?: string[];
		onValueChange?: (value: string[]) => void;
	}

	let { items, value = $bindable([]), onValueChange }: Props = $props();

	let selectedLabel = $derived(
		value.length
			? items.filter((item) => value.includes(item.value)).map((item) => item.label)
			: 'Закрыта'
	);
</script>

<Select type="multiple" allowDeselect={false} bind:value {onValueChange}>
	<SelectTrigger>
		{#if Array.isArray(selectedLabel)}
			<div class="flex gap-1">
				{#each selectedLabel as label}
					<Badge
						variant="outline"
						class="hover:bg-muted {label === 'Twitch' ? 'bg-purple-500/50' : 'bg-orange-500/50'}"
						>{label}</Badge
					>
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
