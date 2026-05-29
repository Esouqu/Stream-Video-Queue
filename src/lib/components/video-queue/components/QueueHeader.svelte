<script lang="ts">
	import G from '$lib/stores/G.svelte';
	import { slide } from 'svelte/transition';
	import { Toggle } from '$lib/components/ui/toggle';
	import VoteIcon from '$lib/components/icons/VoteIcon.svelte';
	import Votes from '$lib/components/votes/Votes.svelte';
	import NumberFormatter from '$lib/utils/NumberFormatter';
	import { Button } from '$lib/components/ui/button';
	import CogIcon from '$lib/components/icons/CogIcon.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ConnectionSelector from '$lib/components/connection-selector/ConnectionsSelector.svelte';
	import { REQUEST_PREFIX } from '$lib/constants';

	function openSheet() {
		const newUrl = new URL(page.url);
		newUrl.searchParams.set('settings', 'open');
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(newUrl, { replaceState: true, keepFocus: true, noScroll: true });
	}
</script>

<div class="flex w-full flex-col">
	<div class="flex items-center justify-between gap-2 p-4 font-semibold">
		<ConnectionSelector />

		<div class="flex">
			<Toggle size="icon" tooltip="Голосование" bind:pressed={G.settings.isPollEnabled}>
				<VoteIcon />
			</Toggle>
			<Button variant="ghost" size="icon" onclick={openSheet}>
				<CogIcon />
			</Button>
		</div>
	</div>

	<div class="flex w-full flex-col px-4">
		{#if G.integrationManager.isChatConnected || G.integrationManager.isDonationConnected}
			<div class="mb-4 flex shrink-0 gap-4" transition:slide>
				{#if G.integrationManager.isChatConnected}
					<div
						class="relative z-1 flex w-full flex-col justify-between overflow-hidden rounded-md bg-elevation-3/50 p-2 font-semibold shadow-sm ring ring-border backdrop-blur-md transition-colors duration-700"
					>
						<div class="text-sm text-muted-foreground">Обычный заказ</div>
						<div class="text-lg">{REQUEST_PREFIX} в чате</div>
					</div>
				{/if}
				{#if G.integrationManager.isDonationConnected}
					<div
						class="relative z-1 flex w-full flex-col justify-between overflow-hidden rounded-md bg-elevation-3/50 p-2 font-semibold shadow-sm ring ring-border backdrop-blur-md transition-colors duration-700"
					>
						<div class="text-sm text-muted-foreground">Приоритетный заказ</div>
						<div class="text-lg">
							{#if G.settings.isPaidTimeEnabled}
								{NumberFormatter.formatCurrency(G.settings.paidTimePricePerMinute)}/мин
							{:else}
								{NumberFormatter.formatCurrency(G.settings.paidVideoPrice)}
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/if}

		{#if G.settings.isPollEnabled}
			<div
				class="mb-4 w-full shrink-0 overflow-hidden rounded-md bg-elevation-3/30 shadow-sm ring ring-border backdrop-blur-md transition-colors duration-700"
				transition:slide|global
			>
				<Votes />
			</div>
		{/if}
	</div>
</div>
