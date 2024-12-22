<script lang="ts">
	import { fly } from 'svelte/transition';

	interface Props {
		value: number;
	}

	let { value }: Props = $props();

	let slicedValue = $derived(value.toString().split(''));
</script>

<div class="relative grid overflow-hidden">
	{#each slicedValue as digit, idx (digit + `${idx}`)}
		<div
			style="grid-column: {idx + 1}; grid-row: 1;"
			in:fly={{ y: -10, duration: 300 }}
			out:fly={{ y: 10, duration: 300 }}
		>
			{digit}
		</div>
	{/each}
</div>
