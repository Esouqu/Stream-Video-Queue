<script lang="ts">
	import queue from '$lib/stores/queue';
	import { flip } from 'svelte/animate';
	import { fade, fly } from 'svelte/transition';
	import dragIcon from '$lib/assets/drag_indicator_icon.svg';
	import Draggable from './Draggable.svelte';
	import playIcon from '$lib/assets/play_arrow_icon.svg';
	import VideoPreview from './VideoPreview.svelte';
	import type { IQueueVideoInfo } from '$lib/interfaces';

	// amount of buffered items that is outside of visible view but is rendered
	const itemHeight = 80;
	const itemsBuffer = 3;
	const itemsBufferHeight = itemsBuffer * itemHeight;
	const TRANSITION_DURATION = 200;

	export let scrollElement: HTMLDivElement;

	let scrollTop = 0;
	let windowHeight: number;
	let startIndex: number;
	let endIndex: number;
	let visibleItems: (IQueueVideoInfo & { position: number })[] = [];
	let isDeleteAction = false;

	$: currentVideo = queue.currentVideo;
	$: mappedQueue = [...$queue].map((l, idx) => ({ ...l, position: idx + 1 }));
	$: {
		// Position of the top of the viewport
		const viewportTop = scrollTop - itemsBufferHeight;
		// Index of the potential start item
		const potentialStartIndex = Math.floor(viewportTop / itemHeight);
		// Position of the bottom of the viewport
		const viewportBottom = scrollTop + windowHeight + itemsBufferHeight;
		// Index of the potential end item
		const potentialEndIndex = Math.floor(viewportBottom / itemHeight);
		// Ensure potentialEndIndex does not exceed the length of the mappedQueue
		const clampedEndIndex = Math.min(mappedQueue.length, potentialEndIndex);

		startIndex = Math.max(0, potentialStartIndex);
		endIndex = Math.max(startIndex, clampedEndIndex);
		visibleItems = mappedQueue.slice(startIndex, endIndex);
	}

	function onScroll(e: UIEvent) {
		const target = e.target as HTMLDivElement;

		scrollTop = target.scrollTop;
	}
</script>

<svelte:window bind:innerHeight={windowHeight} />

<div class="queue" bind:this={scrollElement} on:scroll={onScroll} aria-hidden>
	<ul
		class="queue-list"
		style="grid-auto-rows: {itemHeight}px; height: {itemHeight * $queue.length}px;"
	>
		{#each visibleItems as video (video.id)}
			{@const { id, videoId, position, isPaid, ...rest } = video}
			{@const isCurrentVideo = $currentVideo?.id === video.id}

			<div
				class="queue-item"
				class:selected={isCurrentVideo}
				class:premium={video.isPaid}
				style="grid-row: {position};"
				animate:flip={{ duration: TRANSITION_DURATION }}
			>
				<Draggable
					handle=".draggable"
					bind:isReachedEnd={isDeleteAction}
					on:dragstopmin={() => queue.remove(video)}
				>
					<div class="queue-item-icon-wrapper" class:draggable={!isCurrentVideo} aria-hidden>
						<img
							src={isCurrentVideo ? playIcon : dragIcon}
							alt="Drag Indicator"
							draggable="false"
						/>
					</div>
					<VideoPreview {...rest} on:click={() => !isCurrentVideo && queue.setCurrent(video)} />
					<div class="queue-item-delete-bg">
						{#if isDeleteAction}
							<p transition:fade={{ duration: 100 }}>Удалить</p>
						{/if}
					</div>
				</Draggable>
			</div>
		{:else}
			<div class="queue-list-empty" in:fade={{ duration: 300 }}>
				<p>Очередь пуста</p>
			</div>
		{/each}
	</ul>
</div>

<style lang="scss">
	.queue {
		position: relative;
		flex: 1;
		padding: 15px 10px 0 0;
		scrollbar-gutter: stable;
		overflow-y: auto;
		overflow-x: hidden;

		&-list {
			display: grid;
			grid-auto-flow: row;
			padding: 0;
			margin: 0;
			width: 100%;
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

		&-item {
			position: relative;
			display: flex;
			flex-direction: row;
			padding: 5px 10px 5px 0;
			color: var(--on-surface);
			transition: background-color 0.2s;
			cursor: pointer;

			&.premium {
				&::before {
					content: '';
					position: absolute;
					top: 0;
					left: 0;
					width: 33%;
					height: 100%;
					opacity: 0.5;
					background: var(--primary-50);
					background: linear-gradient(90deg, var(--primary-60) 0%, rgba(255 255 255 / 0) 100%);
				}
			}
			&.selected {
				background-color: var(--hover-white);
				cursor: default;

				&.premium::before {
					opacity: 1;
				}
				&:hover {
					background-color: rgba(255 255 255 / 10%);
				}
			}

			&-delete-bg {
				position: fixed;
				top: 0;
				left: -100px;
				z-index: -1;
				display: flex;
				justify-content: center;
				align-items: center;
				width: 100px;
				height: 100%;
				font-weight: 600;
				font-size: 0.9rem;
				color: var(--on-error-container);
				background-color: var(--error-container);
			}

			&:hover {
				background-color: var(--hover-white);
			}

			&:active {
				background-color: transparent;
			}

			&-icon-wrapper {
				display: flex;
				padding: 0 10px 0 5px;
				width: 25px;
				user-select: none;
				cursor: grab;

				&:not(.draggable) {
					cursor: default;
				}

				&:active {
					filter: brightness(0.5);
					cursor: grabbing;
				}

				& img {
					width: 100%;
				}
			}
		}
	}
</style>
