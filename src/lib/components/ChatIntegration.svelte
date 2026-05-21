<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Input } from './ui/input';
	import IntegrationBase from './IntegrationBase.svelte';

	interface Props {
		title: string;
		channel: string;
		icon: Snippet;
	}

	let { title, channel = $bindable(''), icon }: Props = $props();
</script>

<IntegrationBase>
	{#snippet titleSlot()}
		{@render icon()}
		{title}
	{/snippet}
	{#snippet inputSlot()}
		<Input
			id={title}
			type="text"
			placeholder="Название канала"
			value={channel}
			onenter={(e) => (channel = e.currentTarget.value)}
			onfocusout={(e) => (channel = e.currentTarget.value)}
		/>
	{/snippet}
</IntegrationBase>
