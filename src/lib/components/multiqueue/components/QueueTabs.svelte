<script lang="ts">
	import CogIcon from '$lib/components/icons/CogIcon.svelte';
	import DonationAlertsIcon from '$lib/components/icons/DonationAlertsIcon.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Spinner } from '$lib/components/ui/spinner';
	import { Tabs, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import type { MultiQueueStore } from '$lib/stores/MultiQueueStore.svelte';
	import type { QueueItemData } from '$lib/types';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleDashed from '@lucide/svelte/icons/circle-dashed';
	import { slide } from 'svelte/transition';

	type Props = {
		queueStore: MultiQueueStore<Required<QueueItemData>>;
	};

	let { queueStore }: Props = $props();

	let socketState = $state('disconnected');

	function disconnect() {
		socketState = 'disconnected';
	}

	function connect() {
		if (socketState === 'connected') {
			disconnect();
			return;
		}

		socketState = 'connecting';
		setTimeout(() => {
			socketState = 'connected';
		}, 3000);
	}
</script>

<!-- <Select type="single">
			<SelectTrigger class="w-full">Выберите тип</SelectTrigger>
			<SelectContent>
				<SelectItem value="twitch">Twitch</SelectItem>
				<SelectItem value="donation">Donation</SelectItem>
			</SelectContent>
		</Select> -->

<div class="w-full rounded-lg bg-elevation-2 p-2 shadow-sm">
	<div class="flex items-center">
		<div class="flex gap-2 px-2 py-1 font-semibold text-muted-foreground">
			<DonationAlertsIcon />
			Donation
		</div>

		<Button variant="ghost" class="ml-auto" onclick={connect}>
			{#if socketState === 'disconnected'}
				<CircleDashed />
			{:else if socketState === 'connecting'}
				<Spinner class="size-6" />
			{:else if socketState === 'connected'}
				<CircleCheck class="text-green-500" />
			{/if}
		</Button>
	</div>

	{#if socketState === 'connected'}
		<div class="mt-2 flex justify-center gap-2" transition:slide>
			{#if queueStore.splittedItems.length > 1}
				<Tabs>
					<TabsList class="bg-elevation-1">
						{#each queueStore.splittedItems as queue, idx}
							<TabsTrigger value={idx.toString()}>
								<div>{idx + 1}</div>
								<div class="rounded-full bg-neutral-500 px-1.5 py-0.5 text-xs text-white">
									{queue.length}
								</div>
							</TabsTrigger>
						{/each}
					</TabsList>
				</Tabs>
			{:else}
				<div class="rounded-full bg-neutral-500 px-1.5 py-0.5 text-xs text-white">
					{queueStore.splittedItems[0].length}
				</div>
			{/if}
			<div>
				{#each queueStore.values as value, idx}
					<div class="w-full rounded-lg bg-red-300/10 px-2 py-1 text-center font-semibold">
						{idx + 1} — {value}P/мин
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
