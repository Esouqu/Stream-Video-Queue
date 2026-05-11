<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';

	export const toggleVariants = tv({
		base: "relative text-muted-foreground aria-invalid:ring-destructive/20 aria-invalid:border-destructive inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium whitespace-nowrap transition-[color,box-shadow,scale] outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-6 cursor-pointer",
		variants: {
			variant: {
				default: 'hover:scale-110 data-[state=on]:text-foreground',
				outline:
					'border-input hover:bg-accent hover:text-accent-foreground border bg-transparent shadow-xs'
			},
			size: {
				default: 'h-9 px-4 py-2 has-[>svg]:px-3',
				sm: 'h-8 min-w-8 px-1.5',
				lg: 'h-10 min-w-10 px-2.5',
				icon: 'size-9',
				'icon-sm': 'size-8',
				'icon-lg': 'size-10'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	});

	export type ToggleVariant = VariantProps<typeof toggleVariants>['variant'];
	export type ToggleSize = VariantProps<typeof toggleVariants>['size'];
	export type ToggleVariants = VariantProps<typeof toggleVariants>;
</script>

<script lang="ts">
	import { Toggle as TogglePrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip';

	let {
		ref = $bindable(null),
		pressed = $bindable(false),
		class: className,
		size = 'default',
		variant = 'default',
		tooltip,
		...restProps
	}: TogglePrimitive.RootProps & {
		tooltip?: string;
		variant?: ToggleVariant;
		size?: ToggleSize;
	} = $props();
</script>

{#if tooltip}
	<Tooltip>
		<TooltipTrigger>
			{#snippet child({ props })}
				<TogglePrimitive.Root
					bind:ref
					bind:pressed
					data-slot="toggle"
					class={cn(toggleVariants({ variant, size }), className)}
					{...restProps}
					{...props}
				/>
			{/snippet}
		</TooltipTrigger>
		<TooltipContent>
			{tooltip}
		</TooltipContent>
	</Tooltip>
{:else}
	<TogglePrimitive.Root
		bind:ref
		bind:pressed
		data-slot="toggle"
		class={cn(toggleVariants({ variant, size }), className)}
		{...restProps}
	/>
{/if}
