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
	import { Previous } from 'runed';
	import RepeatIcon from '$lib/components/icons/RepeatIcon.svelte';
	import PlayIcon from '$lib/components/icons/PlayIcon.svelte';
	import PauseIcon from '$lib/components/icons/PauseIcon.svelte';
	import type VideoPlayerStore from '$lib/stores/VideoPlayerStore.svelte';
	import appStore from '$lib/stores/AppStore.svelte';
	import { Progress } from '$lib/components/ui/progress';
	import NumberFormatter from '$lib/utils/NumberFormatter';
	import EmptyQueueItem from './EmptyQueueItem.svelte';

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

	let circleClientWidth = $state(0);
	let circleClientHeight = $state(0);
	let circleRef = $state<HTMLDivElement>();
	let panelRef = $state<HTMLDivElement>();

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

	const rgb = $derived(currentItem ? currentItem.color : [0, 0, 0]);
	const prevRgb = new Previous(() => rgb);
	const firstGradientStep = $derived(`rgb(${rgb[0]} ${rgb[1]} ${rgb[2]} / 0.4)`);
	const secondGradientStep = $derived(
		`rgb(${prevRgb.current?.[0]} ${prevRgb.current?.[1]} ${prevRgb.current?.[2]} / 0.4)`
	);
	const formattedPaidTimerTime = $derived(
		NumberFormatter.formatTimerValue(appStore.paidTimer.current, appStore.paidTimer.startTime)
	);
	const formattedPaidTimerStartTime = $derived(
		NumberFormatter.formatTimerValue(appStore.paidTimer.startTime, appStore.paidTimer.startTime)
	);

	// TODO:
	// make gradient to be same color as current when clicked on pause/play

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
	}

	async function skipForward(e: ButtonMouseEvent) {
		e.stopPropagation();
		onSkipForwardClick?.();
		animateCircle(e);
	}

	function animateCircle(event: ButtonMouseEvent) {
		if (!circleRef || !panelRef) return;

		const parentRect = panelRef.getBoundingClientRect();
		const relativeX = event.clientX - parentRect.left;
		const relativeY = event.clientY - parentRect.top;

		createTimeline()
			.add(circleRef, {
				scale: [0, 1],
				opacity: [1, 1],
				duration: 350,
				ease: 'outQuad',
				onBegin: ({ targets }) => {
					for (const target of targets) {
						target.style = `
							--c1: ${firstGradientStep};
							--c2: ${secondGradientStep};
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
					ease: 'outBack',
					duration: 350
				},
				'0'
			)
			.add(circleRef, {
				opacity: 0
			});
	}
</script>

<div
	bind:this={panelRef}
	class={cn(
		`group pointer-events-auto relative z-10 flex shrink-0 overflow-hidden rounded-md shadow-md ring ring-(--panel-color) backdrop-blur-md transition-colors duration-700`,
		className
	)}
	style="--panel-color: rgb({rgb[0]} {rgb[1]} {rgb[2]} / 0.3); background: linear-gradient(0deg, oklch(0 0 0 / 0.3) 10%, transparent), var(--panel-color);"
>
	<div class="relative z-30 flex w-full flex-col justify-center gap-3">
		<div class="p-2 pt-3 pb-0 text-sm font-semibold text-muted-foreground">
			Текущее видео [{appStore.queue.index + 1} / {appStore.queue.size}]
		</div>

		{#if currentItem}
			<QueueItem class="py-0" isCurrent item={currentItem} {onRemoveClick} {onInfoClick} />
		{:else}
			<EmptyQueueItem />
		{/if}

		<div class="mx-auto mb-3 flex items-center gap-2">
			<Toggle size="icon" tooltip="Повтор видео" bind:pressed={appStore.shouldLoop}>
				<RepeatIcon />
			</Toggle>
			<div class="flex items-center gap-2">
				<Button variant="ghost" disabled={appStore.queue.size < 1} onclick={skipBackward}>
					<SkipBackwardIcon />
				</Button>
				<Button
					variant="ghost"
					size="icon-lg"
					class="p-0"
					disabled={videoPlayer.isBuffering || !videoPlayer.isReady}
					onclick={play}
				>
					{#if videoPlayer.isPlaying}
						<PauseIcon class="size-full" />
					{:else if videoPlayer.canPlay || !videoPlayer.isPlaying}
						<PlayIcon class="size-full" />
					{/if}
				</Button>
				<Button variant="ghost" disabled={appStore.queue.size < 1} onclick={skipForward}>
					<SkipForwardIcon />
				</Button>
			</div>
			<Toggle size="icon" tooltip="Добавлять в случайном порядке" bind:pressed={isShuffled}>
				<ShuffleIcon />
			</Toggle>
		</div>

		{#if !appStore.paidTimer.isUnstarted}
			<div class="pointer-events-none absolute inset-0 -z-1 size-full" transition:fade>
				<Progress
					class="size-full rounded-none bg-transparent **:data-[slot=progress-indicator]:bg-white/5 **:data-[slot=progress-indicator]:transition-none"
					value={appStore.paidTimer.current}
					max={appStore.paidTimer.startTime}
				/>
			</div>
			<div
				class="pointer-events-none absolute bottom-0 left-0 -z-1 w-full opacity-0 transition-opacity group-hover:opacity-100"
				transition:fade
			>
				<div class="mb-1 flex justify-between px-2 text-sm font-semibold text-muted-foreground">
					<div>
						{formattedPaidTimerTime}
					</div>
					<div>
						{formattedPaidTimerStartTime}
					</div>
				</div>
				<Progress
					class="h-1 w-full rounded-none bg-white/10 **:data-[slot=progress-indicator]:bg-white/20 **:data-[slot=progress-indicator]:transition-none"
					value={appStore.paidTimer.current}
					max={appStore.paidTimer.startTime}
				/>
			</div>
		{/if}
	</div>

	<div
		bind:this={circleRef}
		bind:clientWidth={circleClientWidth}
		bind:clientHeight={circleClientHeight}
		class="pointer-events-none absolute z-20 size-200 rounded-full bg-radial from-(--c1) from-15% via-(--c2) opacity-0"
	></div>
</div>
