<script lang="ts">
	import { flip } from 'svelte/animate';
	import { onMount, type Snippet } from 'svelte';
	import { ScrollArea } from './ui/scroll-area';
	import type { IQueueItem } from '$lib/interfaces';
	import { remToPx } from '$lib/utils';

	interface Props {
		items: IQueueItem[];
		currentItemIndex: number;
		scrollElement?: HTMLDivElement | null;
		children: Snippet<[IQueueItem & { position: number }]>;
	}

	const itemsBuffer = 3;

	let { items, currentItemIndex, scrollElement = $bindable(null), children }: Props = $props();

	let scrollTop = $state(0);
	let itemHeight = $state(remToPx(5.5));
	let itemsBufferHeight = $derived(itemsBuffer * itemHeight);
	let windowHeight: number = $state(0);
	let minHeight: number = $state(0);
	let visibleItems: (IQueueItem & { position: number })[] = $state([]);
	let mappedItems = $derived(items.map((l, idx) => ({ ...l, position: idx + 1 })));

	onMount(() => {
		if (scrollElement) {
			minHeight = scrollElement.offsetHeight;

			setTimeout(() => scrollToCurrentItem(), 300);
		}
	});

	$effect(() => {
		if (scrollElement) {
			// Position of the top of the viewport
			const viewportTop = scrollTop - itemsBufferHeight;
			// Index of the potential start item
			const potentialStartIndex = Math.floor(viewportTop / itemHeight);
			// Position of the bottom of the viewport
			const viewportBottom = scrollTop + scrollElement.offsetHeight + itemsBufferHeight;
			// Index of the potential end item
			const potentialEndIndex = Math.floor(viewportBottom / itemHeight);
			// Ensure potentialEndIndex does not exceed the length of the mappedItems
			const clampedEndIndex = Math.min(mappedItems.length, potentialEndIndex);
			const startIndex = Math.max(0, potentialStartIndex);
			const endIndex = Math.max(startIndex, clampedEndIndex);

			visibleItems = mappedItems.slice(startIndex, endIndex);
			minHeight = Math.max(
				scrollElement.offsetHeight,
				itemHeight * mappedItems.length + remToPx(0.5)
			);
		}
	});

	$effect(() => {
		if (scrollElement && currentItemIndex >= 0) {
			scrollToCurrentItem();
		}
	});

	function scrollToCurrentItem() {
		if (!scrollElement) return;

		const scrollToOffset = (itemsBuffer / 2) * itemHeight;
		const targetPosition = currentItemIndex * itemHeight;

		scrollElement.scrollTo({
			top: Math.max(targetPosition - scrollToOffset, 0),
			behavior: 'smooth'
		});
	}

	function onresize() {
		itemHeight = remToPx(5.5);
	}

	function onscroll(e: UIEvent) {
		const target = e.target as HTMLDivElement;

		scrollTop = target.scrollTop;
	}
</script>

<svelte:window bind:innerHeight={windowHeight} {onresize} />

<ScrollArea class="relative flex h-full" bind:ref={scrollElement} {onscroll}>
	<div
		class="grid grid-flow-row py-1 transition-[height] duration-200"
		style="grid-auto-rows: {itemHeight}px; height: {minHeight}px;"
	>
		{#each visibleItems as item (item.id)}
			<div class="flex" style="grid-row: {item.position};" animate:flip={{ duration: 200 }}>
				{@render children(item)}
			</div>
		{:else}
			<div class="absolute top-1/2 -translate-y-1/2 flex justify-center items-center w-full h-full">
				<p class="text-lg font-medium text-muted-foreground">Очередь пуста</p>
			</div>
		{/each}
	</div>
</ScrollArea>
