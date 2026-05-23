<script lang="ts">
	import VirtualList from '../VirtualList.svelte';
	import QueueItem from './components/QueueItem.svelte';
	import G from '$lib/stores/G.svelte';
	import type { QueueItemData } from '$lib/types';
	import SkipForwardIcon from '../icons/SkipForwardIcon.svelte';
	import QueueHeader from './components/QueueHeader.svelte';
	import { slide } from 'svelte/transition';
	import ControlPanel from './components/ControlPanel.svelte';
	import EmptyQueueItem from './components/EmptyQueueItem.svelte';
	import ClearQueueButton from '../ClearQueueButton.svelte';

	const itemHeight = 102;
	const itemsBuffer = 10;

	let viewportRef = $state<HTMLDivElement | null>(null);

	function onItemSelect(item: QueueItemData) {
		G.queue.select(item);
		viewportRef?.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<div
	class="relative m-4 ml-0 flex w-100 shrink-0 flex-col items-center overflow-hidden rounded-md bg-elevation-2 shadow-sm"
>
	<QueueHeader />

	<VirtualList
		bind:viewportRef
		class="w-full overflow-hidden"
		items={G.queue.upcoming}
		{itemHeight}
		{itemsBuffer}
	>
		{#snippet header()}
			<div class="py-2">
				<div class="pointer-events-none px-2" transition:slide>
					<ControlPanel
						currentItem={G.queue.current}
						videoPlayer={G.youtubePlayer}
						onSkipBackwardClick={() => G.queue.previous()}
						onSkipForwardClick={() => G.queue.next()}
						onRemoveClick={() => G.queue.current && G.removeVideo(G.queue.current)}
						bind:isShuffled={G.queue.shouldInsertRandomly}
					/>
				</div>
			</div>
		{/snippet}

		{#snippet child(item)}
			<QueueItem
				{item}
				onSelect={(item) => onItemSelect(item)}
				onRemoveClick={() => G.removeVideo(item)}
			/>
		{/snippet}

		{#snippet empty()}
			{#if G.isLoadingItems}
				<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
				{#each { length: 5 } as _, idx (idx)}
					<EmptyQueueItem />
				{/each}
			{:else if G.queue.isEmpty}
				<div
					class="absolute inset-0 flex size-full flex-col items-center justify-center gap-1 text-center font-semibold text-muted-foreground"
				>
					<span class="text-lg">Очередь пуста.</span>
				</div>
			{:else if G.queue.index + 1 === G.queue.size}
				<div
					class="absolute inset-0 flex size-full flex-col items-center justify-center gap-2 text-center font-semibold text-muted-foreground"
				>
					<div class="flex flex-col">
						<span>Очередь закончилась.</span>
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
