<script lang="ts">
	import { Select as SelectPrimitive, type WithoutChild } from 'bits-ui';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithoutChild<SelectPrimitive.TriggerProps> = $props();
</script>

<SelectPrimitive.Trigger
	bind:ref
	class={cn(
		'flex h-10 w-full items-center justify-between rounded-md border border-zinc-700 bg-transparent px-3 py-2 text-sm text-secondary-foreground ring-offset-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:rounded-b-none data-[placeholder]:text-muted-foreground [&>span]:line-clamp-1',
		className
	)}
	{...restProps}
>
	{@render children?.()}
	<ChevronDown class="size-4" />
</SelectPrimitive.Trigger>
