<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	import { Skeleton } from './ui/skeleton';
	import GalleryIcon from './icons/GalleryIcon.svelte';

	type Props = HTMLAttributes<HTMLDivElement> & {
		src: string;
		alt: string;
	};

	const { src, alt, class: className, ...restProps }: Props = $props();

	const imageResult = $derived.by(loadImage);

	function loadImage() {
		return new Promise<string | null>((resolve) => {
			if (!src) return resolve(null);

			const img = new Image();
			img.onload = () => resolve(src);
			img.onerror = () => resolve(null);
			img.src = src;
		});
	}
</script>

<div class={cn('relative flex h-full w-full shrink-0 select-none', className)} {...restProps}>
	{#await imageResult}
		<Skeleton class="size-full" />
	{:then image}
		{#if image}
			<div in:fade|global>
				<img
					data-slot="loader-image"
					src={image}
					class="w-full object-cover"
					{alt}
					draggable={false}
				/>
			</div>
		{:else}
			<div
				data-slot="image-loader-placeholder"
				class="flex size-full items-center justify-center rounded-lg bg-input text-sm font-semibold text-muted-foreground"
				in:fade|global
			>
				<GalleryIcon class="size-full max-w-10 text-input" />
			</div>
		{/if}
	{/await}
</div>
