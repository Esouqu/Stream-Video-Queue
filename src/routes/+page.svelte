<script lang="ts">
	import appManager from '$lib/scripts/AppManager.svelte';
	import Queue from '$lib/components/Queue.svelte';
	import Draggable from '$lib/components/Draggable.svelte';
	import QueueItem from '$lib/components/QueueItem.svelte';
	import SkipForward from 'lucide-svelte/icons/skip-forward';
	import AutoIndicator from '$lib/components/AutoIndicator.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import DeleteQueue from '$lib/components/DeleteQueue.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Toggle } from '$lib/components/ui/toggle';
	import ShuffleIcon from 'lucide-svelte/icons/shuffle';
	import EyeOffIcon from 'lucide-svelte/icons/eye-off';
	import { INTEGRATION, SOCKET_STATE } from '$lib/enums';
	import Spinner from '$lib/components/Spinner.svelte';
	import { slide } from 'svelte/transition';
	import MultipleSelect from '$lib/components/MultipleSelect.svelte';
	import Settings from '$lib/components/settings/Settings.svelte';

	let scrollElement: HTMLDivElement | null = $state(null);
	let queueItems = $derived(appManager.queue.items);
	let unseenQueueItems = $derived(appManager.queue.unseen);
	let currentItems = $derived(appManager.queue.shouldHideWatched ? unseenQueueItems : queueItems);
	let currentItemIndex = $derived(appManager.queue.currentIndex);
	let selectItems = $derived([
		{
			label: 'DonationAlerts',
			value: INTEGRATION.DONATIONALERTS,
			disabled: appManager.centrifugoSocket.state !== SOCKET_STATE.OPEN
		},
		{
			label: 'Twitch',
			value: INTEGRATION.TWITCH,
			disabled: appManager.twitchChatSocket.state !== SOCKET_STATE.OPEN
		}
	]);
</script>

<svelte:head>
	<title
		>{appManager.queue.current?.title
			? `${appManager.queue.current.title} - QueueTube`
			: 'QueueTube'}</title
	>
</svelte:head>

<div class="relative flex flex-col overflow-hidden border-l">
	<div class="flex flex-col items-center p-4">
		<div class="flex w-full flex-col gap-1">
			<span class="text-sm font-medium">
				Очередь
				{#if queueItems && unseenQueueItems}
					<Badge variant="outline">{unseenQueueItems.length} / {queueItems.length}</Badge>
				{/if}
			</span>
			<MultipleSelect items={selectItems} bind:value={appManager.enabledIntegrations} />
		</div>

		{#if appManager.enabledIntegrations.includes(INTEGRATION.DONATIONALERTS)}
			<div class="mt-4 flex w-full items-center gap-2" transition:slide={{ duration: 200 }}>
				<Badge
					class="w-full justify-between rounded-full border bg-zinc-800 text-sm hover:bg-muted"
				>
					<span>Заказать</span>
					<span>{appManager.donationSettings.requestPrice} RUB</span>
				</Badge>
				{#if appManager.donationSettings.isSkipEnabled}
					<Badge
						class="w-full justify-between rounded-full border bg-zinc-800 text-sm hover:bg-muted"
					>
						<span>Пропустить</span>
						<span>{appManager.videoSkipPrice} RUB</span>
					</Badge>
				{/if}
			</div>
		{/if}
	</div>

	<Separator />

	{#if !currentItems || currentItemIndex === undefined}
		<div class="flex h-full items-center justify-center">
			<Spinner --spinner-size="2rem" />
		</div>
	{:else}
		<Queue items={currentItems} {currentItemIndex} bind:scrollElement>
			{#snippet children(item)}
				{@const isCurrentVideo = appManager.queue.current?.id === item.id}

				<Draggable
					isSelected={isCurrentVideo}
					isWatched={item.isWatched}
					onSwipe={() => appManager.queue.remove(item)}
				>
					<QueueItem
						{...item}
						isSelected={isCurrentVideo}
						onclick={() => !isCurrentVideo && appManager.queue.setCurrent(item)}
					/>
				</Draggable>
			{/snippet}
		</Queue>
	{/if}

	<Separator />

	<div class="flex justify-between p-4">
		<div class="flex items-center gap-1">
			<Button
				class="relative col-start-3 justify-self-end"
				variant="outline"
				disabled={queueItems && queueItems.length < 2}
				onclick={() => appManager.queue.next()}
			>
				{#if appManager.poll.shouldAutoSkip && appManager.poll.isEnabled}
					<AutoIndicator />
				{/if}
				<SkipForward />
				<span>Следующее</span>
			</Button>

			<div class="flex">
				<Toggle bind:pressed={appManager.queue.shouldPlayRandomly}>
					<ShuffleIcon />
				</Toggle>
				<Toggle class="relative" bind:pressed={appManager.queue.shouldHideWatched}>
					<EyeOffIcon />
					{#if currentItems && queueItems && appManager.queue.shouldHideWatched}
						<span
							class="absolute right-[-0.25rem] top-[-0.25rem] flex min-w-6 justify-center p-0.5 text-xs"
						>
							{queueItems.length - currentItems.length}
						</span>
					{/if}
				</Toggle>
			</div>
		</div>
		<div>
			<DeleteQueue disabled={(appManager.queue.items?.length || 0) < 1} />
			<Settings />
		</div>
	</div>
</div>
