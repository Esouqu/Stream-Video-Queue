<script lang="ts">
	import type { QueueItemData } from '$lib/types';
	import { cn } from '$lib/utils';
	import { fly, type FlyParams } from 'svelte/transition';
	import DotsIcon from '$lib/components/icons/DotsIcon.svelte';
	import TrashIcon from '$lib/components/icons/TrashIcon.svelte';
	import ImageLoader from '$lib/components/ImageLoader.svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
	import { Command, CommandItem, CommandList } from '$lib/components/ui/command';
	import NumberFormatter from '$lib/utils/NumberFormatter';
	import { cubicOut } from 'svelte/easing';

	type Props = {
		item: QueueItemData;
		class?: string;
		flyDirection?: number;
		isCurrent?: boolean;
		onSelect?: (item: QueueItemData) => void;
		onRemove?: () => void;
	};

	let {
		item,
		class: className,
		flyDirection = 1,
		isCurrent = false,
		onSelect,
		onRemove
	}: Props = $props();

	let clientWidth = $state(0);

	let flyParams = $derived.by<{ in?: FlyParams; out?: FlyParams }>(getFlyParams);
	const viewCount = $derived(NumberFormatter.formatViews(parseInt(item.viewCount)));
	const publishedAt = $derived(NumberFormatter.timeAgo(item.publishedAt));

	function getFlyParams() {
		return {
			in: { y: flyDirection * 196, easing: cubicOut },
			out: { y: flyDirection * -196, easing: cubicOut }
		};
	}

	function handleRemove() {
		flyParams = { out: { x: clientWidth } };
		onRemove?.();
	}
</script>

<div
	class={cn(
		'group relative flex w-full gap-2 rounded-md p-2 transition-colors select-none data-[selectable=true]:cursor-pointer data-[selectable=true]:hover:bg-input',
		className
	)}
	data-selectable={!!onSelect}
	data-current={isCurrent}
	role="button"
	tabindex="0"
	onclick={() => onSelect?.(item)}
	onkeydown={() => {}}
	bind:clientWidth
	in:fly={flyParams.in}
	out:fly={flyParams.out}
>
	<div class="relative">
		<ImageLoader
			class="relative aspect-video h-auto w-38.5 flex-none overflow-hidden rounded-sm"
			src={item.thumbnail}
			alt={item.title}
		/>
		<div
			class="absolute right-1 bottom-1 left-1 flex justify-end gap-1 group-data-[current=true]:hidden"
		>
			{#if item.value > 0}
				<Badge class="px-1 py-0" variant="destructive">
					{NumberFormatter.formatCurrency(item.value)}
				</Badge>
			{/if}
			<Badge class="px-1 py-0" variant={item.isLive ? 'destructive' : 'secondary'}>
				{#if item.isLive}
					LIVE
				{:else if item.durationMs}
					{NumberFormatter.formatMs(item.durationMs)}
				{/if}
			</Badge>
		</div>
	</div>
	<div class="flex w-full flex-col">
		<div class="flex w-full gap-2">
			<div
				class="line-clamp-2 overflow-hidden text-start text-sm font-medium text-ellipsis"
				title={item.title}
			>
				{item.title}
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
					portalProps={{ disabled: true }}
				>
					<Command>
						<CommandList>
							<CommandItem onclick={(e) => e.stopPropagation()} onSelect={handleRemove}>
								<TrashIcon />
								<span>Удалить</span>
							</CommandItem>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>

		<div
			class="mt-0.75 line-clamp-1 flex items-center gap-0.5 text-xs text-ellipsis text-muted-foreground"
		>
			{viewCount} • {publishedAt}
		</div>
		<div
			class="mt-0.75 line-clamp-1 flex items-center gap-0.5 text-xs text-ellipsis text-muted-foreground"
		>
			Заказал {item.submittedBy}
		</div>
	</div>
</div>
