<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

	type Props = {
		titleSlot: Snippet;
		inputSlot: Snippet;
	};

	const { titleSlot, inputSlot }: Props = $props();
</script>

<Card class="relative grid auto-rows-auto grid-cols-[1fr_11rem] gap-x-2 gap-y-0 px-4 py-2">
	<CardHeader class="flex items-center p-0">
		<CardTitle class="flex items-center justify-center gap-2">{@render titleSlot()}</CardTitle>
	</CardHeader>
	<CardContent class="flex min-h-10 items-center justify-end p-0">
		{@render inputSlot()}
	</CardContent>
</Card>
