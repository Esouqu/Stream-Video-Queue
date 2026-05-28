<script lang="ts" generics="T">
	import { Toggle } from '$lib/components/ui/toggle';
	import { Button } from '$lib/components/ui/button';
	import SkipBackwardIcon from '$lib/components/icons/SkipBackwardIcon.svelte';
	import SkipForwardIcon from '$lib/components/icons/SkipForwardIcon.svelte';
	import { createTimeline } from 'animejs';
	import ShuffleIcon from '$lib/components/icons/ShuffleIcon.svelte';
	import QueueItem from '$lib/components/video-queue/components/QueueItem.svelte';
	import { type QueueItemData } from '$lib/types';
	import { fade } from 'svelte/transition';
	import { cn } from '$lib/utils';
	import RepeatIcon from '$lib/components/icons/RepeatIcon.svelte';
	import PlayIcon from '$lib/components/icons/PlayIcon.svelte';
	import PauseIcon from '$lib/components/icons/PauseIcon.svelte';
	import type VideoPlayerStore from '$lib/stores/VideoPlayerStore.svelte';
	import G from '$lib/stores/G.svelte';
	import EmptyQueueItem from './EmptyQueueItem.svelte';
	import { cubicOut } from 'svelte/easing';
	import Blob from '$lib/components/Blob.svelte';
	import VideoProgress from './VideoProgress.svelte';

	type ButtonMouseEvent =
		| (MouseEvent & {
				currentTarget: EventTarget & HTMLButtonElement;
		  })
		| (MouseEvent & {
				currentTarget: EventTarget & HTMLAnchorElement;
		  });

	type Props = {
		videoPlayer: VideoPlayerStore<T>;
		currentItem?: QueueItemData;
		isShuffled?: boolean;
		class?: string;
		onRemoveClick?: () => void;
		onInfoClick?: () => void;
		onSkipBackwardClick?: () => void;
		onSkipForwardClick?: () => void;
	};

	let {
		currentItem,
		class: className,
		videoPlayer,
		isShuffled = $bindable(false),
		onRemoveClick,
		onInfoClick,
		onSkipBackwardClick,
		onSkipForwardClick
	}: Props = $props();

	let flyDirection = $state(1);

	let circleRef = $state<HTMLDivElement>();
	let panelRef = $state<HTMLDivElement>();
	let seed = $state(crypto.randomUUID());

	function play(e: ButtonMouseEvent) {
		e.stopPropagation();

		if (videoPlayer.canPlay) {
			videoPlayer.play();
		} else if (videoPlayer.isPlaying) {
			videoPlayer.pause();
		}

		animateCircle(e);
	}

	async function skipBackward(e: ButtonMouseEvent) {
		e.stopPropagation();
		onSkipBackwardClick?.();
		animateCircle(e);
		flyDirection = G.queueManager.isLastItem ? 0 : -1;
	}

	async function skipForward(e: ButtonMouseEvent) {
		e.stopPropagation();
		onSkipForwardClick?.();
		animateCircle(e);
		flyDirection = G.queueManager.isFirstItem ? 0 : 1;
	}

	function animateCircle(event: ButtonMouseEvent) {
		if (!circleRef || !panelRef) return;

		const parentRect = panelRef.getBoundingClientRect();
		const targetRect = event.currentTarget.getBoundingClientRect();

		const circleClientWidth = circleRef.clientWidth;
		const circleClientHeight = circleRef.clientHeight;
		const relativeX = targetRect.left + targetRect.width / 2 - parentRect.left;
		const relativeY = targetRect.top + targetRect.height / 2 - parentRect.top;

		seed = crypto.randomUUID();

		createTimeline()
			.add(circleRef, {
				scale: [0, 1],
				opacity: [1, 1],
				duration: 500,
				ease: 'outQuad',
				onBegin: ({ targets }) => {
					for (const target of targets) {
						target.style = `
							top: ${relativeY - circleClientHeight / 2}px;
							left: ${relativeX - circleClientWidth / 2}px;
						`;
					}
				}
			})
			.add(
				panelRef,
				{
					scale: [1, 0.95, 1],
					ease: 'outCubic',
					duration: 500
				},
				'0'
			)
			.add(circleRef, {
				opacity: 0
			});
	}
</script>

<div
	class={cn(
		`group pointer-events-auto relative z-1 flex shrink-0 rounded-md transition-colors delay-75 duration-500`,
		className
	)}
>
	<div class="relative z-3 flex w-full flex-col justify-center" bind:this={panelRef}>
		{#if currentItem}
			<div class="grid">
				{#key currentItem}
					<QueueItem
						class="col-start-1 row-start-1 p-3 px-4"
						item={currentItem}
						isCurrent
						flyParams={{
							in: { y: flyDirection * 168, easing: cubicOut },
							out: { y: flyDirection * -168, easing: cubicOut }
						}}
						{onRemoveClick}
						{onInfoClick}
					/>
				{/key}
			</div>
		{:else}
			<EmptyQueueItem class="py-3 pt-4" />
		{/if}

		<div class="mx-auto mb-3 flex items-center gap-2">
			<Toggle size="icon" tooltip="Повтор видео" bind:pressed={G.settings.shouldLoop}>
				<RepeatIcon />
			</Toggle>
			<div class="flex items-center gap-2">
				<Button variant="ghost" disabled={G.queueManager.size < 2} onclick={skipBackward}>
					<SkipBackwardIcon />
				</Button>
				<Button
					variant="ghost"
					size="icon-lg"
					class="p-0 text-foreground!"
					disabled={videoPlayer.isBuffering || !videoPlayer.isReady}
					onclick={play}
				>
					{#if videoPlayer.isPlaying}
						<PauseIcon class="size-full" />
					{:else if videoPlayer.canPlay || !videoPlayer.isPlaying}
						<PlayIcon class="size-full" />
					{/if}
				</Button>
				<Button variant="ghost" disabled={G.queueManager.size < 2} onclick={skipForward}>
					<SkipForwardIcon />
				</Button>
			</div>
			<Toggle size="icon" tooltip="Добавлять в случайном порядке" bind:pressed={isShuffled}>
				<ShuffleIcon />
			</Toggle>
		</div>
	</div>

	<div class="absolute inset-0 -z-1 flex items-center justify-center rounded-md">
		{#if G.queueManager.current}
			<VideoProgress
				current={videoPlayer.currentTime * 1000}
				duration={G.queueManager.current.durationMs || 0}
				start={currentItem?.startMs || 0}
				paidDuration={G.queueManager.currentPaidMs}
				isLive={currentItem?.isLive || false}
			/>
		{/if}

		{#if currentItem}
			{#key currentItem}
				<img
					class="pointer-events-none absolute top-1/2 left-1/2 size-14 -translate-1/2 scale-[8] object-cover opacity-30 blur-xs select-none"
					src={currentItem?.thumbnail}
					alt=""
					draggable="false"
					transition:fade={{ duration: 500 }}
				/>
			{/key}
		{/if}

		<Blob
			bind:ref={circleRef}
			{seed}
			color="rgb(0 0 0 / 0.25)"
			class="pointer-events-none absolute z-2 size-250 opacity-0"
		/>
	</div>
</div>
