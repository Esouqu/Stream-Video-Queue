<script lang="ts" generics="T extends { id: string | number }">
	import { flip } from 'svelte/animate';
	import { type Snippet } from 'svelte';
	import { ScrollArea } from './ui/scroll-area';
	import { cn } from '$lib/utils';

	interface Props {
		items: T[];
		itemsBuffer?: number;
		itemHeight?: number;
		class?: string;
		viewportRef?: HTMLDivElement | null;
		child: Snippet<[T & { position: number }, number]>;
		header?: Snippet;
		empty?: Snippet;
	}

	let {
		items = [],
		itemsBuffer = 10,
		itemHeight = 44,
		class: className,
		viewportRef = $bindable(null),
		child,
		header,
		empty
	}: Props = $props();

	let scrollTop = $state(0);
	let minHeight = $state(0);
	let headerHeight = $state(0);
	let scrollElement = $state<HTMLDivElement | null>(null);
	let wrapperOffsetHeight = $state(0);

	const itemsBufferHeight = $derived(itemsBuffer * itemHeight);
	const itemsWithPosition = $derived.by(getItemsWithPosition);
	const visibleItems = $derived.by(getVisibleItems);
	const itemsHeight = $derived(itemHeight * itemsWithPosition.length);

	$effect(() => {
		onresize();
	});

	function getItemsWithPosition() {
		return items.map((l, idx) => ({ ...l, position: idx + 1 }));
	}

	function getVisibleItems() {
		if (!scrollElement) return [];

		const viewportTop = scrollTop - itemsBufferHeight;
		// Index of the potential start item
		const potentialStartIndex = Math.floor(viewportTop / itemHeight);
		// Position of the bottom of the viewport
		const viewportBottom = scrollTop + scrollElement.offsetHeight + itemsBufferHeight;
		// Index of the potential end item
		const potentialEndIndex = Math.floor(viewportBottom / itemHeight);
		// Ensure potentialEndIndex does not exceed the length of the itemsWithPosition
		const clampedEndIndex = Math.min(itemsWithPosition.length, potentialEndIndex);
		const startIndex = Math.max(0, potentialStartIndex);
		const endIndex = Math.max(startIndex, clampedEndIndex);

		return itemsWithPosition.slice(startIndex, endIndex);
	}

	function onresize() {
		if (!scrollElement) return;

		minHeight = Math.max(wrapperOffsetHeight - headerHeight, itemsHeight);
	}

	function onscroll(e: UIEvent) {
		const target = e.target as HTMLDivElement;

		scrollTop = target.scrollTop;
	}
</script>

<svelte:window {onresize} />

<div class="size-full overflow-hidden" bind:offsetHeight={wrapperOffsetHeight}>
	<ScrollArea
		class={cn('relative flex h-full', className)}
		bind:ref={scrollElement}
		bind:viewportRef
		{onscroll}
	>
		{#if header}
			<div class="pointer-events-none space-y-2" bind:clientHeight={headerHeight}>
				{@render header()}
			</div>
		{/if}

		<div
			class="relative grid grid-flow-row px-2 transition-[height] duration-200"
			style="grid-auto-rows: {itemHeight}px; height: {minHeight}px;"
		>
			{#each visibleItems as item (item.id)}
				<div
					class="flex w-full"
					style="grid-column: 1; grid-row: {item.position};"
					animate:flip={{ duration: 400 }}
				>
					{@render child(item, item.position - 1)}
				</div>
			{:else}
				{@render empty?.()}
			{/each}
		</div>
	</ScrollArea>
</div>
