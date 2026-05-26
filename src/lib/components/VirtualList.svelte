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
		child: Snippet<[T & { index: number }, number]>;
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
	let scrollElement = $state<HTMLDivElement | null>(null);
	let viewportHeight = $state(0);

	const totalItemsHeight = $derived(items.length * itemHeight);
	const range = $derived.by(getRange);
	const visibleItems = $derived.by(getVisibleItems);

	function getVisibleItems() {
		const { start, end } = range;
		const sliced = [];

		for (let i = start; i < end; i++) {
			if (items[i]) {
				sliced.push({ ...items[i], index: i });
			}
		}

		return sliced;
	}

	function getRange() {
		const adjustedScrollTop = Math.max(0, scrollTop);

		const viewportTop = adjustedScrollTop - itemsBuffer * itemHeight;
		const viewportBottom = adjustedScrollTop + viewportHeight + itemsBuffer * itemHeight;

		const start = Math.max(0, Math.floor(viewportTop / itemHeight) - 1);
		const end = Math.min(items.length, Math.ceil(viewportBottom / itemHeight) + 1);

		return { start, end };
	}

	function onscroll(e: UIEvent) {
		const target = e.target as HTMLDivElement;

		scrollTop = target.scrollTop;
	}
</script>

<svelte:window {onresize} />

<div class="size-full overflow-hidden" bind:offsetHeight={viewportHeight}>
	<ScrollArea
		class={cn('relative flex h-full', className)}
		bind:ref={scrollElement}
		bind:viewportRef
		{onscroll}
	>
		<div class="h-full overflow-hidden">
			{#if header}
				{@render header()}
			{/if}

			<div
				class="relative my-2 w-full"
				style:height={items.length > 0 ? `${totalItemsHeight}px` : '100%'}
			>
				{#each visibleItems as item (item.id)}
					<div
						class="absolute right-2 left-2"
						style:top="{item.index * itemHeight}px"
						style:height="{itemHeight}px"
						animate:flip={{ duration: 400 }}
					>
						{@render child(item, item.index)}
					</div>
				{:else}
					{@render empty?.()}
				{/each}
			</div>
		</div>
	</ScrollArea>
</div>
