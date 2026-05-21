<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import XIcon from '@lucide/svelte/icons/x';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: DialogPrimitive.OverlayProps = $props();
</script>

<DialogPrimitive.Overlay
	bind:ref
	data-slot="dialog-overlay"
	class={cn(
		'group fixed inset-0 z-50 cursor-pointer bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
		className
	)}
	{...restProps}
>
	<DialogPrimitive.Close
		class="absolute top-6 right-6 cursor-pointer rounded-xs opacity-70 transition-opacity outline-none group-hover:opacity-100 hover:opacity-100 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
	>
		<XIcon class="size-6" strokeWidth="4" />
		<span class="sr-only">Close</span>
	</DialogPrimitive.Close>
</DialogPrimitive.Overlay>
