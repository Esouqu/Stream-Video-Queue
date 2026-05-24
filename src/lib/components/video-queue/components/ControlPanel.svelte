<script lang="ts" generics="T">
	import { Toggle } from '$lib/components/ui/toggle';
	import { Button } from '$lib/components/ui/button';
	import SkipBackwardIcon from '$lib/components/icons/SkipBackwardIcon.svelte';
	import SkipForwardIcon from '$lib/components/icons/SkipForwardIcon.svelte';
	import { createTimeline } from 'animejs';
	import ShuffleIcon from '$lib/components/icons/ShuffleIcon.svelte';
	import QueueItem from '$lib/components/video-queue/components/QueueItem.svelte';
	import { type QueueItemData } from '$lib/types';
	import { fade, fly } from 'svelte/transition';
	import { cn } from '$lib/utils';
	import { Previous } from 'runed';
	import RepeatIcon from '$lib/components/icons/RepeatIcon.svelte';
	import PlayIcon from '$lib/components/icons/PlayIcon.svelte';
	import PauseIcon from '$lib/components/icons/PauseIcon.svelte';
	import type VideoPlayerStore from '$lib/stores/VideoPlayerStore.svelte';
	import G from '$lib/stores/G.svelte';
	import { Progress } from '$lib/components/ui/progress';
	import NumberFormatter from '$lib/utils/NumberFormatter';
	import EmptyQueueItem from './EmptyQueueItem.svelte';
	import { cubicOut } from 'svelte/easing';

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

	let circleClientWidth = $state(0);
	let circleClientHeight = $state(0);
	let circleRef = $state<HTMLDivElement>();
	let panelRef = $state<HTMLDivElement>();

	const rgb = $derived(currentItem ? currentItem.color : [0, 0, 0]);
	const prevRgb = new Previous(() => rgb);
	const firstGradientStep = $derived(`rgb(${rgb[0]} ${rgb[1]} ${rgb[2]} / 0.4)`);
	const secondGradientStep = $derived(
		`rgb(${prevRgb.current?.[0]} ${prevRgb.current?.[1]} ${prevRgb.current?.[2]} / 0.4)`
	);
	const formattedPaidTimerTime = $derived(
		NumberFormatter.formatTimerValue(G.paidTimer.current, { startMs: G.paidTimer.startTime })
	);
	const formattedPaidTimerStartTime = $derived(
		NumberFormatter.formatTimerValue(G.paidTimer.startTime)
	);

	function play(e: ButtonMouseEvent) {
		e.stopPropagation();

		if (videoPlayer.canPlay) {
			videoPlayer.play();
		} else if (videoPlayer.isPlaying) {
			videoPlayer.pause();
		}

		animateCircle(e, true);
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

	function animateCircle(event: ButtonMouseEvent | null, sameColor = false) {
		if (!circleRef || !panelRef) return;

		const parentRect = panelRef.getBoundingClientRect();

		let relativeY = parentRect.top / 4;
		let relativeX = parentRect.left / 4;

		if (event) {
			const targetRect = event.currentTarget.getBoundingClientRect();

			// Calculate the center point of the button relative to the panel
			relativeX = targetRect.left + targetRect.width / 2 - parentRect.left;
			relativeY = targetRect.top + targetRect.height / 2 - parentRect.top;
		}

		createTimeline()
			.add(circleRef, {
				scale: [0, 1],
				opacity: [1, 1],
				duration: 500,
				ease: 'outQuad',
				onBegin: ({ targets }) => {
					for (const target of targets) {
						target.style = `
							--c1: ${firstGradientStep};
							--c2: ${sameColor ? 'transparent' : secondGradientStep};
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
			.add(
				circleRef,
				{
					opacity: 0
				},
				'-=250'
			);
	}
</script>

<div
	bind:this={panelRef}
	class={cn(
		`group pointer-events-auto relative z-10 flex shrink-0 rounded-md shadow-md ring ring-(--panel-color) backdrop-blur-md transition-colors delay-75 duration-500`,
		className
	)}
	style="--panel-color: rgb({rgb[0]} {rgb[1]} {rgb[2]} / 0.3); background: linear-gradient(0deg, oklch(0 0 0 / 0.3) 10%, transparent), var(--panel-color);"
>
	<div class="relative z-30 flex w-full flex-col justify-center">
		{#if currentItem}
			<div class="grid">
				{#key currentItem}
					<div
						class="col-start-1 row-start-1"
						in:fly={{ y: flyDirection * 200, easing: cubicOut }}
						out:fly={{ y: flyDirection * -200, easing: cubicOut }}
					>
						<QueueItem
							class="py-3 pt-4"
							isCurrent
							item={currentItem}
							{onRemoveClick}
							{onInfoClick}
						/>
					</div>
				{/key}
			</div>
		{:else}
			<EmptyQueueItem class="py-3 pt-4" />
		{/if}

		<div class="mx-auto mb-3 flex items-center gap-2">
			<Toggle size="icon" tooltip="Повтор видео" bind:pressed={G.shouldLoop}>
				<RepeatIcon />
			</Toggle>
			<div class="flex items-center gap-2">
				<Button variant="ghost" disabled={G.queueManager.size < 1} onclick={skipBackward}>
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
				<Button variant="ghost" disabled={G.queueManager.size < 1} onclick={skipForward}>
					<SkipForwardIcon />
				</Button>
			</div>
			<Toggle size="icon" tooltip="Добавлять в случайном порядке" bind:pressed={isShuffled}>
				<ShuffleIcon />
			</Toggle>
		</div>
	</div>

	<div class="absolute inset-0 -z-1 overflow-hidden rounded-md">
		{#if !G.paidTimer.isUnstarted}
			<div class="pointer-events-none absolute inset-0 -z-1 size-full" transition:fade>
				<Progress
					class="size-full rounded-none bg-transparent **:data-[slot=progress-indicator]:bg-white/5 **:data-[slot=progress-indicator]:transition-none"
					value={G.paidTimer.current}
					max={G.paidTimer.startTime}
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
					value={G.paidTimer.current}
					max={G.paidTimer.startTime}
				/>
			</div>
		{/if}

		<div
			bind:this={circleRef}
			bind:clientWidth={circleClientWidth}
			bind:clientHeight={circleClientHeight}
			class="pointer-events-none absolute z-20 size-200 rounded-full bg-radial from-(--c1) from-15% via-(--c2) mask-[radial-gradient(black_10%,transparent)] opacity-0"
		></div>
	</div>
</div>
