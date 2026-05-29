<script lang="ts">
	import VirtualList from '../VirtualList.svelte';
	import QueueItem from './components/QueueItem.svelte';
	import G from '$lib/stores/G.svelte';
	import type { QueueItemData } from '$lib/types';
	import SkipForwardIcon from '../icons/SkipForwardIcon.svelte';
	import QueueHeader from './components/QueueHeader.svelte';
	import { fade } from 'svelte/transition';
	import ControlPanel from './components/ControlPanel.svelte';
	import EmptyQueueItem from './components/EmptyQueueItem.svelte';
	import ClearQueueButton from '../ClearQueueButton.svelte';

	const itemHeight = 102;
	const itemsBuffer = 10;

	let flyDirection = $state(1);
	let viewportRef = $state<HTMLDivElement | null>(null);

	$effect(() => {
		if (G.queueManager.current) {
			flyDirection = 1;
		}
	});

	function onRemove() {
		if (G.queueManager.current) {
			G.queueManager.dequeue(G.queueManager.current);
		}
	}

	function onSkipBackward() {
		G.queueManager.previous();
		flyDirection = G.queueManager.isLastItem ? 0 : -1;
	}

	function onSkipForward() {
		G.queueManager.next();
		flyDirection = G.queueManager.isFirstItem ? 0 : 1;
	}

	function onItemSelect(item: QueueItemData) {
		G.queueManager.select(item);
		viewportRef?.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<div
	class="relative flex h-full w-100 shrink-0 flex-col items-center overflow-hidden rounded-md border bg-elevation-2 shadow-sm"
>
	<QueueHeader />

	<div class="w-full">
		<div
			class="flex items-center justify-between border-b px-4 pb-2 text-sm font-semibold text-muted-foreground"
		>
			<div>Текущее видео</div>
			{#if G.queueManager.current}
				<div class="tabular-nums">
					{G.queueManager.index + 1} / {G.queueManager.size}
				</div>
			{/if}
		</div>
		<ControlPanel
			class="border-b"
			currentItem={G.queueManager.current}
			videoPlayer={G.youtubePlayer}
			{flyDirection}
			bind:isShuffled={G.settings.shouldInsertRandomly}
			{onSkipBackward}
			{onSkipForward}
			{onRemove}
		/>
	</div>

	<VirtualList
		bind:viewportRef
		class="w-full"
		items={G.queueManager.upcoming}
		{itemHeight}
		{itemsBuffer}
	>
		{#snippet header()}
			<div class="px-4 pt-2 text-sm font-semibold whitespace-nowrap text-muted-foreground">
				<div>Далее</div>
			</div>
		{/snippet}
		{#snippet child(item)}
			<QueueItem
				{item}
				{flyDirection}
				onSelect={(item) => onItemSelect(item)}
				onRemove={() => G.queueManager.dequeue(item)}
			/>
		{/snippet}

		{#snippet empty()}
			{#if G.queueManager.isLoading}
				<div class="space-y-2">
					<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
					{#each { length: 5 } as _, idx (idx)}
						<EmptyQueueItem isLoading />
					{/each}
				</div>
			{:else if G.queueManager.isEmpty}
				<div
					class="flex size-full flex-col items-center justify-center gap-1 text-center font-semibold text-muted-foreground"
				>
					<span class="text-lg">Очередь пуста.</span>
				</div>
			{:else if G.queueManager.index + 1 === G.queueManager.size}
				<div
					class="flex size-full flex-col items-center justify-center gap-2 text-center font-semibold text-muted-foreground"
					in:fade|global
				>
					<div class="flex flex-col">
						<span>Конец очереди.</span>
						<span class="text-sm">
							Можете начать сначала, нажав <SkipForwardIcon class="inline size-4" />.
						</span>
					</div>
					<ClearQueueButton size="sm" />
				</div>
			{/if}
		{/snippet}
	</VirtualList>
</div>
