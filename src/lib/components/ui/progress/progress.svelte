<script lang="ts">
	import { Progress as ProgressPrimitive } from 'bits-ui';
	import { cn, type WithoutChildrenOrChild } from '$lib/utils.js';

	type Props = WithoutChildrenOrChild<ProgressPrimitive.RootProps> & {
		reversed?: boolean;
	};

	let {
		ref = $bindable(null),
		class: className,
		max = 100,
		value,
		reversed = false,
		...restProps
	}: Props = $props();

	const progressPercent = $derived((100 * (value ?? 0)) / (max ?? 1));
</script>

<ProgressPrimitive.Root
	bind:ref
	data-slot="progress"
	class={cn(
		'relative h-2 w-full overflow-hidden rounded-full bg-muted transition-colors',
		className
	)}
	{value}
	{max}
	{...restProps}
>
	<div
		data-slot="progress-indicator"
		class="h-full w-full flex-1 bg-primary transition-all"
		style="transform: translateX(-{reversed ? progressPercent : 100 - progressPercent}%)"
	></div>
</ProgressPrimitive.Root>
