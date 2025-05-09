<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	class={cn(
		'overflow-hidden rounded-lg bg-elevation-1 text-card-foreground shadow-[0_4px_6px_hsl(0deg_0%_0%_/_15%)]',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
