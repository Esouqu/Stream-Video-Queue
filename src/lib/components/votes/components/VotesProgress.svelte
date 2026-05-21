<script lang="ts">
	import { Progress } from '$lib/components/ui/progress';
	import type { IconProps } from '@lucide/svelte';
	import type { Component } from 'svelte';

	type Props = {
		title: string;
		value: number;
		total: number;
		isHighlighted?: boolean;
		Icon?: Component<IconProps>;
	};

	const { title, value, total, isHighlighted, Icon }: Props = $props();

	const percent = $derived(total > 0 ? ((value / total) * 100).toFixed(0) : 0);
</script>

<div
	class="group relative transition-colors duration-1000 data-[highlighted=true]:text-green-950"
	data-highlighted={isHighlighted}
>
	<div class="relative z-10 flex justify-between p-2 py-1 font-semibold">
		<div class=" flex items-center gap-1.5">
			<Icon class="text-muted-foreground group-data-[highlighted=true]:text-green-950" />
			{title}
		</div>
		<div class="tabular-nums">
			{percent}% ({value})
		</div>
	</div>
	<Progress
		class="absolute top-0 left-0 size-full rounded-sm bg-neutral-700 duration-500 group-data-[highlighted=true]:bg-green-400 **:data-[slot=progress-indicator]:bg-input/30 **:data-[slot=progress-indicator]:duration-1000 group-data-[highlighted=true]:**:data-[slot=progress-indicator]:bg-white/30"
		{value}
		min={0}
		max={total}
	/>
</div>
