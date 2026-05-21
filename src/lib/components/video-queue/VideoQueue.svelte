<script lang="ts">
	import VirtualList from '../VirtualList.svelte';
	import QueueItem from './components/QueueItem.svelte';
	import appStore from '$lib/stores/AppStore.svelte';
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
		appStore.queue.select(item);
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
		items={appStore.queue.upcoming}
		{itemHeight}
		{itemsBuffer}
	>
		{#snippet header()}
			<div class="py-2">
				<div class="pointer-events-none px-2" transition:slide>
					<ControlPanel
						currentItem={appStore.queue.current}
						videoPlayer={appStore.youtubePlayer}
						onSkipBackwardClick={() => appStore.queue.previous()}
						onSkipForwardClick={() => appStore.queue.next()}
						onRemoveClick={() =>
							appStore.queue.current && appStore.removeVideo(appStore.queue.current)}
						bind:isShuffled={appStore.queue.shouldInsertRandomly}
					/>
				</div>
			</div>
		{/snippet}

		{#snippet child(item)}
			<QueueItem
				{item}
				onSelect={(item) => onItemSelect(item)}
				onRemoveClick={() => appStore.removeVideo(item)}
			/>
		{/snippet}

		{#snippet empty()}
			{#if appStore.isLoadingItems}
				<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
				{#each { length: 5 } as _, idx (idx)}
					<EmptyQueueItem />
				{/each}
			{:else if appStore.queue.isEmpty}
				<div
					class="absolute inset-0 flex size-full flex-col items-center justify-center gap-1 text-center font-semibold text-muted-foreground"
				>
					<span class="text-lg">Очередь пуста.</span>
				</div>
			{:else if appStore.queue.currentIndex + 1 === appStore.queue.size}
				<div
					class="absolute inset-0 flex size-full flex-col items-center justify-center gap-1 text-center font-semibold text-muted-foreground"
				>
					<div class="flex flex-col">
						<span class="text-lg">Очередь закончилась.</span>
						<span class="text-sm">
							Можете начать сначала, нажав <SkipForwardIcon class="inline size-4" />.
						</span>
					</div>
					<div>или</div>
					<ClearQueueButton size="sm" />
				</div>
			{/if}
		{/snippet}
	</VirtualList>
</div>
