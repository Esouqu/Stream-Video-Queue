<script lang="ts">
	import G from '$lib/stores/G.svelte';
	import { slide } from 'svelte/transition';
	import { Toggle } from '$lib/components/ui/toggle';
	import VoteIcon from '$lib/components/icons/VoteIcon.svelte';
	import Votes from '$lib/components/votes/Votes.svelte';
	import NumberFormatter from '$lib/utils/NumberFormatter';
	import IntegrationSelector from '$lib/components/IntegrationSelector.svelte';
	import { Button } from '$lib/components/ui/button';
	import CogIcon from '$lib/components/icons/CogIcon.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	function openSheet() {
		const newUrl = new URL(page.url);
		newUrl.searchParams.set('settings', 'open');
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(newUrl, { replaceState: true, keepFocus: true, noScroll: true });
	}
</script>

<div class="flex w-full flex-col bg-muted">
	<div class="flex items-center justify-between gap-4 p-3 font-semibold text-muted-foreground">
		<IntegrationSelector />
		<div class="flex">
			<Toggle size="icon" tooltip="Голосование" bind:pressed={G.poll.isEnabled}>
				<VoteIcon />
			</Toggle>
			<Button variant="ghost" size="icon" onclick={openSheet}>
				<CogIcon />
			</Button>
		</div>
	</div>

	<div class="flex w-full flex-col px-3">
		{#if G.integrations.isChatEnabled || G.integrations.isDonationEnabled}
			<div class="mb-3 flex shrink-0 gap-3" transition:slide>
				{#if G.integrations.isChatEnabled}
					<div
						class="pointer-events-auto relative flex w-full flex-col justify-between overflow-hidden rounded-md border bg-elevation-3 p-2 font-semibold shadow-sm transition-colors duration-700"
					>
						<div class="text-sm text-muted-foreground">Обычный заказ</div>
						<div class="text-lg">!rq в чате</div>
					</div>
				{/if}
				{#if G.integrations.isDonationEnabled}
					<div
						class="pointer-events-auto relative flex w-full flex-col justify-between overflow-hidden rounded-md border bg-elevation-3 p-2 font-semibold shadow-sm transition-colors duration-700"
					>
						<div class="text-sm text-muted-foreground">Приоритетный заказ</div>
						<div class="text-lg">
							{#if G.paidTimerEnabled}
								{NumberFormatter.formatCurrency(G.paidTimerPricePerMinute)}/мин
							{:else}
								{NumberFormatter.formatCurrency(G.prioritizedVideoPrice)}
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/if}

		{#if G.poll.isEnabled}
			<div class="mb-3 shrink-0" transition:slide|global>
				<Votes
					class="pointer-events-auto w-full overflow-hidden rounded-md border bg-elevation-3 p-2 shadow-sm transition-colors duration-700"
				/>
			</div>
		{/if}
	</div>
</div>
