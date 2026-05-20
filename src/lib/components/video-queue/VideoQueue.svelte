<script lang="ts">
	import VirtualList from '../VirtualList.svelte';
	import ControlPanel from './components/ControlPanel.svelte';
	import QueueItem from '../QueueItem.svelte';
	import appStore from '$lib/stores/AppStore.svelte';
	import type { QueueItemData } from '$lib/types';
	import { slide } from 'svelte/transition';
	import { Spinner } from '../ui/spinner';
	import Votes from '../votes/Votes.svelte';
	import SkipForwardIcon from '../icons/SkipForwardIcon.svelte';
	import { formatCurrencyNumber } from '$lib/utils';
	import Settings from '../settings/Settings.svelte';
	import { Toggle } from '../ui/toggle';
	import VoteIcon from '../icons/VoteIcon.svelte';
	import DevTools from '../DevTools.svelte';
	import { buttonVariants } from '../ui/button';
	import TrashIcon from '../icons/TrashIcon.svelte';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogTrigger
	} from '../ui/alert-dialog';

	const itemHeight = 102;
	const itemsBuffer = 6;

	let viewportRef = $state<HTMLDivElement | null>(null);
	let isAlertOpened = $state(false);

	function onAlertAction() {
		appStore.queue.clear();
		isAlertOpened = false;
	}

	function onItemSelect(item: QueueItemData) {
		appStore.queue.select(item);
		viewportRef?.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<div
	class="relative m-4 ml-0 flex w-100 shrink-0 flex-col items-center overflow-hidden rounded-md bg-muted shadow-sm"
>
	<div class="flex w-full flex-col justify-between gap-2 p-1">
		<div class="flex items-center justify-between px-2 font-semibold text-muted-foreground">
			<div class="flex">
				<Toggle size="icon" tooltip="Голосование" bind:pressed={appStore.poll.isEnabled}>
					<VoteIcon />
				</Toggle>
				<div class="flex">
					<DevTools />
				</div>
			</div>
			Очередь ({appStore.queue.size})
			<Settings />
		</div>
	</div>

	<VirtualList
		bind:viewportRef
		class="w-full overflow-hidden bg-elevation-2"
		items={appStore.queue.upcoming}
		{itemHeight}
		{itemsBuffer}
	>
		{#snippet header()}
			<div class="py-2">
				{#if appStore.queue.current}
					<div class="flex shrink-0 overflow-hidden px-2" transition:slide>
						<div
							class="pointer-events-auto relative flex w-full shrink-0 flex-col justify-between overflow-hidden rounded-md border bg-neutral-700/30 p-2 font-semibold shadow-md backdrop-blur-md transition-colors duration-700"
						>
							<div class="text-sm text-muted-foreground">Приоритетный заказ</div>
							<div class="text-lg">{formatCurrencyNumber(150)}</div>
						</div>
					</div>
					{#if appStore.queue.current && appStore.poll.isEnabled}
						<div class="mt-2 flex shrink-0 overflow-hidden px-2" transition:slide>
							<Votes />
						</div>
					{/if}
					<div class="pointer-events-none mt-2 px-2" transition:slide>
						<ControlPanel
							currentItem={appStore.queue.current}
							videoPlayer={appStore.youtubePlayer}
							onSkipBackwardClick={async () => await appStore.queue.previous()}
							onSkipForwardClick={async () => await appStore.queue.next()}
							onRemoveClick={() =>
								appStore.queue.current && appStore.removeVideo(appStore.queue.current)}
							bind:isShuffled={appStore.queue.shouldInsertRandomly}
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
				{:else if appStore.queue.current}
					Очередь закончилась.<br />
					<span class="text-sm"
						>Нажмите <SkipForwardIcon class="inline size-4" />, чтобы начать сначала</span
					>
				{:else}
					Очередь пуста
				{/if}
			</div>
		{/snippet}
	</VirtualList>

	<div class="absolute right-2 bottom-2">
		<AlertDialog bind:open={isAlertOpened}>
			<AlertDialogTrigger
				class={buttonVariants({ variant: 'ghost', size: 'icon' })}
				disabled={appStore.queue.isEmpty}
			>
				<TrashIcon />
			</AlertDialogTrigger>

			<AlertDialogContent class="w-113">
				<AlertDialogHeader>
					<AlertDialogTitle>Вы уверены?</AlertDialogTitle>
					<AlertDialogDescription class="whitespace-pre-line">
						Нажимая «Удалить», вы <b>навсегда</b> удалите все видео.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Отмена</AlertDialogCancel>
					<AlertDialogAction
						class={buttonVariants({ variant: 'destructive' })}
						onclick={onAlertAction}
					>
						Удалить
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	</div>
</div>
