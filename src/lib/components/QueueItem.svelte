<script lang="ts">
	import type { IQueueItem } from '$lib/interfaces';
	import appManager from '$lib/scripts/AppManager.svelte';
	import Play from 'lucide-svelte/icons/play';
	import { fade, fly } from 'svelte/transition';
	import GripVertical from 'lucide-svelte/icons/grip-vertical';
	import { draggable, type DragEventData, type DragOptions } from '@neodrag/svelte';
	import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
	import { msToHHMMSS } from '$lib/utils';
	import { Portal } from 'bits-ui';

	interface Props extends IQueueItem {
		isSelected?: boolean;
		onclick?: () => void;
	}

	let {
		id,
		title,
		thumbnail,
		submittedBy,
		channelTitle,
		donationAmount,
		startSeconds,
		isSelected,
		isWatched,
		onclick
	}: Props = $props();

	let position = $state({ x: 0, y: 0 });
	let isReachedEnd = $state(false);
	let isDragging = $state(false);
	let draggableOptions: DragOptions = $derived({
		axis: 'x',
		handle: '.drag-handler',
		applyUserSelectHack: true,
		legacyTranslate: false,
		position,
		onDragStart,
		onDrag,
		onDragEnd
	});

	function onDragStart() {
		isDragging = true;
		document.body.classList.add('grabbing');
	}

	function onDrag({ offsetX }: DragEventData) {
		isReachedEnd = false;

		if (offsetX >= 100) {
			position = { x: 100, y: 0 };
			isReachedEnd = true;
		} else if (offsetX <= 0) {
			position = { x: 0, y: 0 };
		}
	}

	function onDragEnd({ offsetX }: DragEventData) {
		if (offsetX >= 100) appManager.queue.remove(id);

		isDragging = false;
		isReachedEnd = false;
		position = { x: 0, y: 0 };

		document.body.classList.remove('grabbing');
	}
</script>

<Tooltip disableHoverableContent delayDuration={500}>
	<TooltipTrigger>
		{#snippet child({ props })}
			<div
				class="group relative flex w-full items-center rounded-lg from-primary to-[11rem] bg-[-11rem_0] bg-no-repeat duration-300 hover:bg-foreground/10 active:bg-transparent data-[selected=true]:bg-gradient-to-r data-[selected=true]:bg-[0_0] data-[dragged=true]:transition-none"
				data-selected={isSelected}
				data-watched={isWatched}
				data-dragged={isDragging}
				use:draggable={draggableOptions}
				{...props}
			>
				{#if isSelected}
					<div class="px-2" in:fly={{ x: -50, duration: 300 }}>
						<Play size="1rem" fill="#e5e7eb" strokeWidth="0" />
					</div>
				{:else}
					<button
						class="drag-handler relative h-full cursor-grab px-2 text-muted-foreground transition-colors hover:text-foreground"
					>
						<GripVertical size="1rem" />
					</button>
					<div
						class="absolute -left-full top-1/2 flex h-6 w-full -translate-y-1/2 items-center justify-end bg-primary/50 pr-6 text-sm font-medium text-primary-foreground"
					>
						{#if isReachedEnd}
							<span transition:fade={{ duration: 200 }}> Удалить </span>
						{/if}
					</div>
				{/if}
				<button
					class="flex w-full items-center gap-2 pr-4 transition-opacity group-data-[selected=true]:!opacity-100 group-data-[watched=true]:opacity-35"
					{onclick}
				>
					<div
						class="relative aspect-video h-full w-32 flex-none select-none overflow-hidden rounded-lg"
						data-highlighted={donationAmount > 0}
					>
						<img
							class="h-full w-full object-cover"
							src={thumbnail}
							alt="Video Thumbnail"
							draggable="false"
						/>
						{#if donationAmount > 0}
							{#if isSelected && appManager.timer.isEnabled}
								<div
									class="absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center bg-background bg-opacity-70 text-sm font-medium"
								>
									{#if appManager.timer.time > 0}
										{appManager.timer.hhmmss}
									{:else}
										Время вышло
									{/if}
								</div>
							{/if}
							<span
								class="absolute bottom-0 right-0 z-20 rounded-tl-lg bg-primary px-1.5 text-xs font-semibold text-primary-foreground"
							>
								{donationAmount} RUB
							</span>
						{/if}
					</div>
					<div class="flex h-full w-full flex-col justify-center">
						<p class="line-clamp-2 overflow-hidden text-ellipsis text-start text-sm font-medium">
							{title}
						</p>
						<p class="line-clamp-1 text-ellipsis text-start text-xs text-muted-foreground">
							{channelTitle}
						</p>
						<p class="line-clamp-1 text-ellipsis text-start text-xs text-muted-foreground">
							<span>
								Добавил
								<span>
									{submittedBy[0]}
									{#if submittedBy.length > 1}
										+ {submittedBy.length - 1}
									{/if}
								</span>
							</span>
						</p>
					</div>
				</button>
			</div>
		{/snippet}
	</TooltipTrigger>

	<Portal>
		<TooltipContent side="left" sideOffset={8} class="max-w-xs bg-zinc-900">
			<div>
				<p><span class="text-sm font-medium">Название</span>: {title}</p>
				<p><span class="text-sm font-medium">Канал</span>: {channelTitle}</p>
				<p>
					<span class="text-sm font-medium">
						Добавил{submittedBy.length > 1 ? 'и' : ''}
					</span>: {submittedBy.join(', ')}
				</p>
				{#if donationAmount > 0}
					<p><span class="text-sm font-medium">Сумма</span>: {donationAmount} RUB</p>
				{/if}
				{#if startSeconds > 0}
					<p><span class="text-sm font-medium">Старт</span>: {msToHHMMSS(startSeconds * 1000)}</p>
				{/if}
			</div>
		</TooltipContent>
	</Portal>
</Tooltip>
