<script lang="ts">
	import { Switch as SwitchPrimitive } from 'bits-ui';
	import { cn, type WithoutChildrenOrChild } from '$lib/utils.js';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';

	type Props = WithoutChildrenOrChild<SwitchPrimitive.RootProps> & {
		size?: 'default' | 'flattened';
	};

	let {
		ref = $bindable(null),
		class: className,
		checked = $bindable(false),
		size = 'default',
		...restProps
	}: Props = $props();
</script>

<SwitchPrimitive.Root
	bind:ref
	bind:checked
	data-slot="switch"
	data-size={size}
	class={cn(
		'group/switch relative inline-flex h-8 w-13 shrink-0 cursor-pointer items-center overflow-hidden rounded-full border-2 border-input bg-elevation-1 transition-all duration-300 hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-50 data-[size=flattened]:h-6.5 data-[size=flattened]:w-11 data-[state=checked]:bg-input',
		className
	)}
	{...restProps}
>
	<SwitchPrimitive.Thumb
		data-slot="switch-thumb"
		class={cn(
			'relative z-10 flex size-6 items-center justify-center rounded-full bg-primary text-background ring-0 transition-all duration-250 group-active/switch:scale-80 group-active/switch:opacity-70 group-data-[size=flattened]/switch:size-5 data-[state=checked]:translate-x-[calc(100%-0.2rem)] group-data-[size=flattened]/switch:data-[state=checked]:translate-x-[calc(100%-0.15rem)] data-[state=unchecked]:translate-x-0.5 data-[state=unchecked]:bg-input'
		)}
	>
		<Check
			class="hidden size-5 group-data-[size=flattened]/switch:size-4.5 group-data-[state=checked]/switch:block"
			strokeWidth="3"
		/>
		<X
			class="hidden size-5 text-input group-data-[size=flattened]/switch:size-4.5 group-data-[state=unchecked]/switch:block"
			strokeWidth="3"
		/>
	</SwitchPrimitive.Thumb>
</SwitchPrimitive.Root>
