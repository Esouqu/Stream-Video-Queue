<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';
	import { cn, type WithoutChild } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		size = 'default',
		...restProps
	}: WithoutChild<SelectPrimitive.TriggerProps> & {
		size?: 'sm' | 'default';
	} = $props();
</script>

<SelectPrimitive.Trigger
	bind:ref
	data-slot="select-trigger"
	data-size={size}
	class={cn(
		"group flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border-2 border-input bg-elevation-1/40 px-3 py-2 whitespace-nowrap outline-input transition-all duration-300 outline-none select-none selection:bg-primary/30 selection:text-accent-foreground placeholder:text-muted-foreground hover:border-neutral-500 hover:bg-primary/10 focus-visible:border-neutral-500 focus-visible:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 data-[state=open]:rounded-b-none data-[state=open]:border-b-transparent [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
		className
	)}
	{...restProps}
>
	{@render children?.()}
	<ChevronDownIcon class="size-5 text-muted-foreground group-data-[state=open]:hidden" />
	<ChevronUpIcon class="size-5 text-muted-foreground group-data-[state=closed]:hidden" />
</SelectPrimitive.Trigger>
