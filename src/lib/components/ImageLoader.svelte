<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	import { Skeleton } from './ui/skeleton';
	import GalleryIcon from './icons/GalleryIcon.svelte';
	import { onMount } from 'svelte';

	type Props = HTMLAttributes<HTMLDivElement> & {
		src?: string | null;
		alt: string;
	};

	const { src, alt, class: className, ...restProps }: Props = $props();

	let isLoading = $state(true);
	let srcResult = $state<string | null>(null);

	onMount(() => {
		loadSrcResult();
	});

	async function loadSrcResult() {
		isLoading = true;
		const src = await loadImage();
		isLoading = false;

		srcResult = src;
	}

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
	{#if isLoading}
		<Skeleton class="size-full" />
	{:else if srcResult}
		<div in:fade|global>
			<img
				data-slot="loader-image"
				src={srcResult}
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
</div>
