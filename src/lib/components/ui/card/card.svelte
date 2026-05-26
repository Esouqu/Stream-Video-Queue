<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="card"
	class={cn(
		'flex flex-col overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm has-data-[slot=card-content]:*:data-[slot=card-header]:border-b',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
