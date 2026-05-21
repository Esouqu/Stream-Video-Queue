<script lang="ts" module>
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { type VariantProps, tv } from 'tailwind-variants';
	import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip';

	export const buttonVariants = tv({
		base: "relative aria-invalid:ring-destructive/20 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-all outline-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-6 cursor-pointer select-none hover:before:opacity-100 hover:before:scale-100 before:absolute before:inset-0 before:bg-primary/10 before:size-full active:before:scale-100 active:before:bg-primary/30 active:before:outline-primary/30 before:rounded-full before:opacity-0 before:pointer-events-none before:scale-30 before:outline-transparent before:outline-2 before:transition-[scale,opacity,color,background-color,outline-color] before:duration-[0.2s,0.2s,0.3s,0.3s,0.15s]",
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90',
				destructive: 'bg-red-900 hover:bg-red-900/80 text-red-300',
				positive: 'bg-green-900 hover:bg-green-900/80 text-green-300',
				outline: 'bg-elevation-2 hover:bg-primary/10 hover:text-accent-foreground border',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: ' [&>svg]:z-10 hover:text-foreground',
				link: 'text-primary underline-offset-4 hover:underline before:hidden'
			},
			size: {
				default: 'h-9 px-4 has-[>svg]:px-3',
				sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
				lg: 'h-10 px-6 has-[>svg]:px-4',
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

	export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
	export type ButtonSize = VariantProps<typeof buttonVariants>['size'];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			tooltip?: string;
			variant?: ButtonVariant;
			size?: ButtonSize;
		};
</script>

<script lang="ts">
	let {
		class: className,
		variant = 'default',
		size = 'default',
		ref = $bindable(null),
		href = undefined,
		type = 'button',
		disabled,
		tooltip,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

{#if tooltip}
	<Tooltip>
		<TooltipTrigger>
			{#snippet child({ props })}
				<button
					bind:this={ref}
					data-slot="button"
					class={cn(buttonVariants({ variant, size }), className)}
					{type}
					{disabled}
					{...restProps}
					{...props}
				>
					{@render children?.()}
				</button>
			{/snippet}
		</TooltipTrigger>
		<TooltipContent>
			{tooltip}
		</TooltipContent>
	</Tooltip>
{:else if href}
	<a
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? 'link' : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
