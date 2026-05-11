<script lang="ts">
	import VirtualList from '../VirtualList.svelte';
	import ControlPanel from './components/ControlPanel.svelte';
	import QueueItem from '../QueueItem.svelte';
	import appStore from '$lib/stores/AppStore.svelte';
	import type { QueueItemData } from '$lib/types';
	import TwitchIntegration from '../TwitchIntegration.svelte';
	import { slide } from 'svelte/transition';
	import { Spinner } from '../ui/spinner';
	import Votes from '../votes/Votes.svelte';

	const itemHeight = 102;
	const itemsBuffer = 6;

	let viewportRef = $state<HTMLDivElement | null>(null);

	function onItemSelect(item: QueueItemData) {
		appStore.twitchQueue.select(item);
		viewportRef?.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<div class="m-4 ml-0 flex w-100 shrink-0 flex-col gap-2">
	<TwitchIntegration>
		<VirtualList
			bind:viewportRef
			class="overflow-hidden bg-elevation-2"
			items={appStore.twitchQueue.upcoming}
			{itemHeight}
			{itemsBuffer}
		>
			{#snippet header()}
				<div class="py-2">
					{#if appStore.twitchQueue.current}
						<div class="flex shrink-0 overflow-hidden px-2" transition:slide>
							<div
								class="pointer-events-auto relative flex w-full shrink-0 flex-col justify-between gap-2 overflow-hidden rounded-md border bg-neutral-700/30 p-2 font-semibold shadow-md backdrop-blur-md transition-colors duration-700"
							>
								<div class="text-sm text-muted-foreground">Заказать видео (приоритет)</div>
								<div class="text-lg">150 RUB</div>
							</div>
						</div>
						{#if appStore.twitchQueue.current && appStore.poll.isEnabled}
							<div class="mt-2 flex shrink-0 overflow-hidden px-2" transition:slide>
								<Votes />
							</div>
						{/if}
						<div class="pointer-events-none mt-2 px-2" transition:slide>
							<ControlPanel
								currentItem={appStore.twitchQueue.current}
								videoPlayer={appStore.youtubePlayer}
								onSkipBackwardClick={() => appStore.twitchQueue.previous()}
								onSkipForwardClick={() => appStore.twitchQueue.next()}
								onRemoveClick={() =>
									appStore.twitchQueue.current &&
									appStore.removeVideo(appStore.twitchQueue.current)}
								bind:isShuffled={appStore.twitchQueue.isRandomOrder}
							/>
						</div>
					{/if}
				</div>
			{/snippet}
			{#snippet children(item)}
				<QueueItem
					{item}
					onSelect={(item) => onItemSelect(item)}
					onRemoveClick={() => appStore.removeVideo(item)}
				/>
			{/snippet}
			{#snippet empty()}
				<div class="text-center text-lg font-semibold text-muted-foreground">
					{#if appStore.isLoadingItems}
						<Spinner class="size-10" />
					{:else if appStore.twitchQueue.current}
						Плейлист закончился.<br />
						<span class="text-sm">Нажмите вперед, чтобы начать сначала</span>
					{:else}
						Плейлист пуст
					{/if}
				</div>
			{/snippet}
		</VirtualList>
	</TwitchIntegration>
</div>
