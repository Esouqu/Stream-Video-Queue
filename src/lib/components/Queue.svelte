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
	const itemsBuffer = 10;

	export let scrollElement: HTMLDivElement;

	let itemHeight = 80;
	let scrollTop = 0;
	let windowHeight: number;
	let startIndex: number;
	let endIndex: number;
	let visibleItems: (IQueueVideoInfo & { position: number })[] = [];
	let isDeleteAction = false;

	$: mappedQueue = [...$queue].map((l, idx) => ({ ...l, position: idx + 1 }));
	$: minRows = Math.max(9, mappedQueue.length);
	$: {
		startIndex = Math.max(0, Math.floor((scrollTop - windowHeight) / itemHeight));
		endIndex = Math.min(
			mappedQueue.length,
			Math.max(
				startIndex,
				Math.floor((scrollTop + windowHeight + itemsBuffer * itemHeight) / itemHeight)
			)
		);

		visibleItems = mappedQueue.slice(startIndex, endIndex);
	}
	$: currentVideo = queue.currentVideo;

	function onScroll(e: UIEvent) {
		const target = e.target as HTMLDivElement;

		scrollTop = target.scrollTop;
	}
</script>

<svelte:window bind:innerHeight={windowHeight} />

<div class="queue" bind:this={scrollElement} on:scroll={onScroll} aria-hidden>
	<!-- <div> -->
	<ul class="queue-list" style="grid-template-rows: repeat({minRows}, {itemHeight}px);">
		{#each visibleItems as video (video.id)}
			{@const { id, videoId, position, isPaid, ...rest } = video}
			{@const isCurrentVideo = $currentVideo?.id === video.id}

			<div
				class="queue-item"
				class:selected={isCurrentVideo}
				class:premium={video.isPaid}
				style="grid-row: {position};"
				in:fly={{ x: -100, duration: 200 }}
				out:fly={{ x: 200, duration: 200 }}
				animate:flip={{ duration: 200 }}
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
	<!-- </div> -->
</div>

<style lang="scss">
	.queue {
		flex: 1;
		padding: 15px 10px 0 0;
		scrollbar-gutter: stable;
		overflow-y: auto;
		overflow-x: hidden;

		&-list {
			position: relative;
			display: grid;
			padding: 0;
			margin: 0;
			width: 100%;
			list-style-type: none;

			&-empty {
				position: absolute;
				top: 50%;
				translate: 0 -50%;
				display: flex;
				justify-content: center;
				align-items: center;
				width: 100%;
				font-size: 20px;
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
					// background: linear-gradient(90deg, rgba(245, 117, 7, 1) 0%, rgba(245, 156, 7, 1) 35%);
					// background-color: var(--primary-60);
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
				font-size: 14px;
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

					&:active {
						filter: brightness(1);
						cursor: default;
					}
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
