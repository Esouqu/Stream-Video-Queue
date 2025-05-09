<script lang="ts">
	import appManager from '$lib/scripts/AppManager.svelte';
	import Queue from '$lib/components/Queue.svelte';
	import QueueItem from '$lib/components/QueueItem.svelte';
	import SkipForward from 'lucide-svelte/icons/skip-forward';
	import { Button } from '$lib/components/ui/button';
	import DeleteQueue from '$lib/components/DeleteQueue.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Toggle } from '$lib/components/ui/toggle';
	import ShuffleIcon from 'lucide-svelte/icons/shuffle';
	import EyeOffIcon from 'lucide-svelte/icons/eye-off';
	import { INTEGRATION, SOCKET_STATE } from '$lib/enums';
	import Spinner from '$lib/components/Spinner.svelte';
	import { slide } from 'svelte/transition';
	import IntegrationSelect from '$lib/components/IntegrationSelect.svelte';
	import Settings from '$lib/components/settings/Settings.svelte';
	import { Tooltip, TooltipContent, TooltipTrigger } from '$lib/components/ui/tooltip';

	let scrollElement: HTMLDivElement | null = $state(null);
	let queueItems = $derived(appManager.queue.items);
	let unseenQueueItems = $derived(appManager.queue.unseen);
	let currentItems = $derived(appManager.queue.shouldHideWatched ? unseenQueueItems : queueItems);
	let currentItemIndex = $derived(appManager.queue.currentIndex);
	let selectItems = $derived([
		{
			label: 'Twitch',
			color: 'bg-purple-500/50',
			value: INTEGRATION.TWITCH,
			disabled: appManager.twitchChatSocket.state !== SOCKET_STATE.OPEN
		},
		{
			label: 'DonationAlerts',
			color: 'bg-orange-500/50',
			value: INTEGRATION.DONATIONALERTS,
			disabled: appManager.centrifugoSocket.state !== SOCKET_STATE.OPEN
		}
	]);
</script>

<svelte:head>
	<title>
		{appManager.queue.current?.title
			? `${appManager.queue.current.title} - QueueTube`
			: 'QueueTube'}
	</title>
</svelte:head>

<div
	class="relative m-4 ml-0 flex flex-col overflow-hidden rounded-lg bg-elevation-1 shadow-[0_4px_6px_hsl(0deg_0%_0%_/_15%)]"
>
	<div class="relative flex flex-col items-center bg-elevation-2 px-4 py-2">
		<div class="flex w-full flex-col gap-1">
			<span class="text-sm font-medium text-muted-foreground">
				Очередь
				<Badge class="bg-transparent px-2 text-muted-foreground hover:bg-transparent">
					{unseenQueueItems?.length || 0} / {queueItems?.length || 0}
				</Badge>
			</span>
			<div class="flex items-center gap-2">
				<IntegrationSelect items={selectItems} bind:value={appManager.enabledIntegrations} />
				<Settings />
			</div>
		</div>

		{#if appManager.enabledIntegrations.includes(INTEGRATION.DONATIONALERTS)}
			<div
				class="flex w-full items-center gap-2 bg-elevation-2 py-3"
				transition:slide={{ duration: 200 }}
			>
				<Badge
					variant="secondary"
					class="flex w-full justify-center rounded-lg p-2 text-sm font-semibold"
				>
					Заказать — {appManager.donationSettings.requestPrice} RUB
				</Badge>
				{#if appManager.donationSettings.isSkipEnabled}
					<Badge
						variant="secondary"
						class="flex w-full justify-center rounded-lg p-2 text-sm font-semibold"
					>
						Скип — {appManager.videoSkipPrice} RUB
					</Badge>
				{/if}
			</div>
		{/if}
	</div>

	{#if !currentItems || currentItemIndex === undefined}
		<div class="flex h-full items-center justify-center">
			<Spinner size={42} />
		</div>
	{:else}
		<Queue items={currentItems} {currentItemIndex} bind:scrollElement>
			{#snippet children(item)}
				{@const isCurrentVideo = appManager.queue.current?.id === item.id}

				<QueueItem
					{...item}
					isSelected={isCurrentVideo}
					onclick={() => !isCurrentVideo && appManager.queue.setCurrent(item)}
				/>
			{/snippet}
		</Queue>
	{/if}

	<div class="flex justify-between bg-elevation-2 p-2">
		<div class="flex">
			<Button
				class="relative col-start-3 mr-3 justify-self-end from-primary to-purple-500 data-[autoskip=true]:bg-gradient-to-r"
				data-autoskip={appManager.poll.shouldAutoSkip && appManager.poll.isEnabled}
				disabled={queueItems && queueItems.length < 2}
				onclick={() => appManager.queue.next()}
			>
				<SkipForward />
				<span>Следующее</span>
			</Button>
			<div class="flex items-center">
				<Tooltip disableHoverableContent delayDuration={300}>
					<TooltipTrigger>
						{#snippet child({ props })}
							<Toggle {...props} bind:pressed={appManager.queue.shouldPlayRandomly}>
								<ShuffleIcon />
							</Toggle>
						{/snippet}
					</TooltipTrigger>
					<TooltipContent>Воспроизводить случайно</TooltipContent>
				</Tooltip>
				<Tooltip disableHoverableContent delayDuration={300}>
					<TooltipTrigger>
						{#snippet child({ props })}
							<Toggle class="relative" {...props} bind:pressed={appManager.queue.shouldHideWatched}>
								<EyeOffIcon />
								{#if currentItems && queueItems && appManager.queue.shouldHideWatched}
									<span
										class="absolute right-[-0.25rem] top-[-0.25rem] flex min-w-6 justify-center p-0.5 text-xs"
									>
										{queueItems.length - currentItems.length}
									</span>
								{/if}
							</Toggle>
						{/snippet}
					</TooltipTrigger>
					<TooltipContent>Скрывать просмотренное</TooltipContent>
				</Tooltip>
			</div>
		</div>
		<DeleteQueue />
	</div>
</div>
