<script lang="ts">
	import queue from '$lib/stores/queue';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import type { IQueueVideoInfo } from '$lib/interfaces';
	import Spinner from './Spinner.svelte';
	import { onMount } from 'svelte';

	const itemHeight = 80;
	const itemsBuffer = 3;
	const itemsBufferHeight = itemsBuffer * itemHeight;

	export let scrollElement: HTMLDivElement;
	export let items: IQueueVideoInfo[];
	export let shouldSort = false;

	let scrollTop = 0;
	let windowHeight: number;
	let minHeight: number;
	let startIndex: number;
	let endIndex: number;
	let visibleItems: (IQueueVideoInfo & { position: number })[] = [];

	$: isQueueLoading = queue.isLoading;
	$: mappedItems = mapQueue(items);
	$: {
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

			startIndex = Math.max(0, potentialStartIndex);
			endIndex = Math.max(startIndex, clampedEndIndex);
			visibleItems = mappedItems.slice(startIndex, endIndex);
			minHeight = Math.max(scrollElement.offsetHeight, itemHeight * mappedItems.length);
		}
	}

	onMount(() => (minHeight = scrollElement.offsetHeight));

	function mapQueue(q: IQueueVideoInfo[]) {
		if (shouldSort) {
			q = [...q].sort((a, b) => b.price - a.price);
		}

		return q.map((l, idx) => ({ ...l, position: idx + 1 }));
	}

	function onScroll(e: UIEvent) {
		const target = e.target as HTMLDivElement;

		scrollTop = target.scrollTop;
	}
</script>

<svelte:window bind:innerHeight={windowHeight} />

<div class="queue" bind:this={scrollElement} on:scroll={onScroll}>
	<ul class="queue-list" style="grid-auto-rows: {itemHeight}px; height: {minHeight}px;">
		{#each visibleItems as item (item.id)}
			<div class="queue-item" style="grid-row: {item.position};" animate:flip={{ duration: 200 }}>
				<slot {item} />
			</div>
		{:else}
			<div class="queue-list-empty" transition:fade>
				{#if $isQueueLoading}
					<Spinner --spinner-size="40px" />
				{:else}
					<p>Очередь пуста</p>
				{/if}
			</div>
		{/each}
	</ul>
</div>

<style lang="scss">
	.queue {
		height: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		scrollbar-gutter: stable;

		&-list {
			position: relative;
			display: grid;
			grid-auto-flow: row;
			padding: 0;
			margin: 0;
			list-style-type: none;
			transition: height 0.2s ease 0.2s;

			&-empty {
				position: absolute;
				top: 50%;
				translate: 0 -50%;
				display: flex;
				justify-content: center;
				align-items: center;
				width: 100%;
				font-size: 1.25rem;
				color: var(--on-surface);
				opacity: 0.7;
			}
		}
	}
</style>
