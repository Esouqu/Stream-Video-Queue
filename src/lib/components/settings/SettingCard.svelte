<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Card, CardContent } from '../ui/card';
	import { slide } from 'svelte/transition';

	interface Props {
		isExtended?: boolean;
		header: Snippet;
		content?: Snippet;
	}

	const { isExtended, header, content }: Props = $props();
</script>

<Card>
	<CardContent class="flex flex-col overflow-hidden p-0">
		<div class="bg-elevation-2 p-4">{@render header()}</div>

		{#if content}
			{#if isExtended || isExtended === undefined}
				<div class="flex flex-col gap-4 p-4" transition:slide>
					{@render content()}
				</div>
			{/if}
		{/if}
	</CardContent>
</Card>
