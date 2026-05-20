<script lang="ts">
	import type { QueueItemData } from '$lib/types';
	import { cn, formatViews, timeAgo } from '$lib/utils';
	import { fly, type FlyParams } from 'svelte/transition';
	import DotsIcon from './icons/DotsIcon.svelte';
	import InfoIcon from './icons/InfoIcon.svelte';
	import TrashIcon from './icons/TrashIcon.svelte';
	import ImageLoader from './ImageLoader.svelte';
	import { buttonVariants } from './ui/button';
	import { Badge } from './ui/badge';
	import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
	import { Command, CommandItem, CommandList } from './ui/command';

	type Props = {
		item: QueueItemData;
		class?: string;
		isCurrent?: boolean;
		onSelect?: (item: QueueItemData) => void;
		onRemoveClick?: () => void;
		onInfoClick?: () => void;
	};

	let flyType = $state<'moving' | 'remove'>('moving');

	const {
		item,
		class: className,
		isCurrent = false,
		onSelect,
		onRemoveClick,
		onInfoClick
	}: Props = $props();

	const flyParams = $derived.by<FlyParams>(getFlyParams);

	function handleRemoveClick() {
		onRemoveClick?.();
		flyType = 'remove';
	}

	function getFlyParams() {
		if (isCurrent) {
			return { duration: 0 };
		}

		switch (flyType) {
			case 'moving':
				return { y: -200 };
			case 'remove':
				return { x: 200 };
		}
	}
</script>

<div
	class={cn(
		'group relative flex w-full gap-2 rounded-md p-2 transition-colors select-none data-[selectable=true]:cursor-pointer data-[selectable=true]:hover:bg-input',
		className
	)}
	data-selectable={!!onSelect}
	role="button"
	tabindex="0"
	onclick={() => onSelect?.(item)}
	onkeydown={() => {}}
	transition:fly={flyParams}
>
	<div class="relative">
		<ImageLoader
			class="relative aspect-video h-auto w-38.5 flex-none overflow-hidden rounded-sm"
			src={item.thumbnail}
			alt="video thumbnail"
		/>
		<div class="absolute right-1 bottom-1 left-1 flex justify-end gap-1">
			{#if item.value > 0}
				<Badge class="rounded border-transparent bg-destructive px-1 py-0">₽</Badge>
			{/if}
			<Badge
				class="rounded border-transparent bg-background/70 px-1 py-0 data-[live=true]:bg-destructive"
				data-live={item.isLive}
			>
				{#if item.isLive}
					LIVE
				{:else if item.duration}
					{item.duration}
				{/if}
			</Badge>
		</div>
	</div>
	<div class="flex w-full flex-col">
		<div class="flex w-full gap-2">
			<div class="w-full">
				<div class="line-clamp-2 overflow-hidden text-start text-sm font-medium text-ellipsis">
					{item.title}
				</div>
				<div
					class="mt-0.75 line-clamp-1 text-start text-xs text-ellipsis text-muted-foreground transition group-data-[selected=true]:text-red-300/50"
				>
					{item.channelTitle}
				</div>
			</div>
			<Popover>
				<PopoverTrigger
					class={cn(
						buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
						'translate-x-0.75 -translate-y-0.75',
						className
					)}
					onclick={(e) => e.stopPropagation()}
				>
					<DotsIcon class="rotate-90" />
				</PopoverTrigger>
				<PopoverContent
					class="w-fit border border-input p-1"
					hideWhenDetached
					preventScroll
					sideOffset={4}
					align="end"
					portalProps={{ disabled: !isCurrent }}
				>
					<Command>
						<CommandList>
							<CommandItem onclick={(e) => e.stopPropagation()} onSelect={handleRemoveClick}>
								<TrashIcon />
								<span>Удалить</span>
							</CommandItem>
							<CommandItem onclick={(e) => e.stopPropagation()} onSelect={onInfoClick}>
								<InfoIcon />
								<span>Доп. информация</span>
							</CommandItem>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
		<div
			class="mt-0.75 line-clamp-1 flex items-center gap-0.5 text-xs text-ellipsis text-muted-foreground"
		>
			<!-- <EyeIcon class="inline size-3.5" /> -->
			{formatViews(parseInt(item.viewCount))} • {timeAgo(item.publishedAt)}
		</div>
	</div>
</div>
