<script lang="ts">
	import { onMount } from 'svelte';
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

	let loadedSrc: string | undefined = $state();
	let error = $state('');

	onMount(() => {
		loadImage(src)
			.then((img) => (loadedSrc = img.src))
			.catch((err) => {
				error = err.message;
				console.error(err);
			});
	});

	function loadImage(url: string) {
		return new Promise<HTMLImageElement>((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = () => reject();
			img.src = url;
		});
	}
</script>

<div class={cn('relative flex h-full w-full shrink-0 select-none', className)} {...restProps}>
	{#if loadedSrc}
		<div class="w-full" in:fade>
			<img
				data-slot="loader-image"
				src={loadedSrc}
				class="size-full object-cover"
				{alt}
				draggable={false}
			/>
		</div>
	{:else if error}
		<div
			class="flex size-full items-center justify-center rounded-lg bg-input text-sm font-semibold text-muted-foreground"
		>
			<GalleryIcon class="size-10 text-input" />
		</div>
	{:else}
		<Skeleton class="size-full" />
	{/if}
</div>
