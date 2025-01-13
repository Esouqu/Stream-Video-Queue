<script lang="ts">
	import { Portal } from 'bits-ui';
	import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
	import type { IQueueItem } from '$lib/interfaces';
	import { msToHHMMSS } from '$lib/utils';
	import appManager from '$lib/scripts/AppManager.svelte';

	interface Props extends IQueueItem {
		isSelected?: boolean;
		isDimmed?: boolean;
		onclick?: () => void;
	}

	let {
		title,
		thumbnail,
		submittedBy,
		channelTitle,
		donationAmount,
		startSeconds,
		isSelected,
		onclick
	}: Props = $props();
</script>

<Tooltip disableHoverableContent delayDuration={1000}>
	<TooltipTrigger class="w-full" {onclick}>
		<div class="relative flex w-full items-center gap-2 py-2">
			<div
				class="relative aspect-video h-full w-32 flex-none select-none overflow-hidden rounded-lg"
				class:shadow-[0_0_0.25rem_black]={isSelected}
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
						class="absolute bottom-0 right-0 rounded-tl-lg bg-primary px-1.5 text-xs font-medium text-primary-foreground"
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
				<p class="text-ellipsis text-start text-xs text-muted-foreground">
					Добавил {submittedBy[0]}
					{#if submittedBy.length > 1}
						+ {submittedBy.length - 1}
					{/if}
				</p>
			</div>
		</div>
	</TooltipTrigger>

	<Portal>
		<TooltipContent side="left" sideOffset={48} class="max-w-xs bg-zinc-900">
			<div>
				<p><span class="text-sm font-medium">Название</span>: {title}</p>
				<p><span class="text-sm font-medium">Канал</span>: {channelTitle}</p>
				<p>
					<span class="text-sm font-medium">
						Добавил{submittedBy.length > 1 ? 'и' : ''}
					</span>: {submittedBy.join(', ')}
				</p>
				<p><span class="text-sm font-medium">Сумма</span>: {donationAmount} RUB</p>
				<p><span class="text-sm font-medium">Старт</span>: {msToHHMMSS(startSeconds * 1000)}</p>
			</div>
		</TooltipContent>
	</Portal>
</Tooltip>
