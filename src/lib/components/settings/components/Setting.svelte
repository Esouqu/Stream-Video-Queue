<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';

	type Props = {
		title: Snippet;
		description?: Snippet;
		input?: Snippet;
		content?: Snippet;
		isEnabled?: boolean;
		isSub?: boolean;
	};

	const { title, description, input, content, isEnabled, isSub }: Props = $props();
</script>

<Card
	class="group data-[sub=true]:rounded-none data-[sub=true]:border-none data-[sub=true]:bg-transparent data-[sub=true]:shadow-none"
	data-sub={isSub}
	data-no-description={!description}
>
	<CardHeader
		class="grid grid-cols-[0.6fr_0.4fr] gap-4 group-data-[sub=true]:p-0 data-[no-input=true]:grid-cols-[1fr]"
		data-no-input={!input}
	>
		<div class="flex h-full flex-col gap-0.5 group-data-[no-description=true]:justify-center">
			<CardTitle class="group-data-[sub=true]:text-sm">
				{@render title()}
			</CardTitle>
			{#if description}
				<CardDescription>
					{@render description()}
				</CardDescription>
			{/if}
		</div>
		{#if input}
			<div class="flex w-full justify-end group-data-[sub=true]:justify-start">
				{@render input?.()}
			</div>
		{/if}
	</CardHeader>

	{#if content && (isEnabled === undefined || isEnabled)}
		<div transition:slide>
			<CardContent>
				{@render content()}
			</CardContent>
		</div>
	{/if}
</Card>
