<script lang="ts" module>
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from 'svelte/elements';
	import { type VariantProps, tv } from 'tailwind-variants';

	export const inputVariants = tv({
		base: 'flex h-10 w-full min-w-0 rounded-lg border-2 outline-none border-input px-3 py-2 text-base transition-all duration-300 selection:bg-primary/30 selection:text-accent-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 outline-input hover:border-neutral-500 focus-visible:border-neutral-500',
		variants: {
			variant: {
				default: 'bg-elevation-1/40 focus-visible:bg-neutral-700 hover:bg-primary/10',
				outline: 'hover:bg-foreground/10 focus-visible:outline-input focus-visible:bg-neutral-900'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	});

	export type InputVariant = VariantProps<typeof inputVariants>['variant'];
	export type InputType = Exclude<HTMLInputTypeAttribute, 'file'>;

	export type Props = WithElementRef<
		Omit<HTMLInputAttributes, 'type'> &
			({ type: 'file'; files?: FileList } | { type?: InputType; files?: undefined })
	> & {
		error?: string;
		variant?: InputVariant;
		onenter?: (e: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) => void;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		value = $bindable(),
		variant = 'default',
		type,
		files = $bindable(),
		class: className,
		error,
		onenter,
		onkeydown,
		onfocus,
		onblur,
		...restProps
	}: Props = $props();

	let isFocused = $state(false);

	function onFocus(e: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		isFocused = true;
		onfocus?.(e);
	}

	function onBlur(e: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		isFocused = false;
		onblur?.(e);
	}

	function onKeyDown(e: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		if (e.key === 'Enter') {
			onenter?.(e);
			ref?.blur();
		}

		onkeydown?.(e);
	}
</script>

{#if type === 'file'}
	<input
		bind:this={ref}
		data-slot="input"
		class={cn(inputVariants({ variant }), className)}
		type="file"
		bind:files
		bind:value
		onkeydown={onKeyDown}
		{...restProps}
	/>
{:else}
	<div
		class="relative flex flex-col"
		class:w-full={className?.includes('w-full')}
		class:size-full={className?.includes('size-full')}
	>
		<input
			bind:this={ref}
			data-slot="input"
			class={cn(inputVariants({ variant }), className)}
			{type}
			aria-invalid={!!error}
			bind:value
			onkeydown={onKeyDown}
			onfocus={onFocus}
			onblur={onBlur}
			{...restProps}
		/>

		<!-- {#if suffix}
			<span
				class="pointer-events-none absolute top-1/2 right-4 z-20 -translate-y-1/2 text-muted-foreground data-[suffix-size=sm]:right-3 data-[suffix-size=sm]:text-sm"
				data-suffix-size={suffixSize}
			>
				{suffix}
			</span>
		{/if} -->
		{#if error}
			<span class="text-sm font-semibold text-destructive">{error}</span>
		{/if}
	</div>
{/if}
