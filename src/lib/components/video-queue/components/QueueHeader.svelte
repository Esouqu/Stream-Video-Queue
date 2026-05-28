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
	import ConnectionSelector from '$lib/components/ConnectionsSelector.svelte';
	import { REQUEST_PREFIX } from '$lib/constants';

	function openSheet() {
		const newUrl = new URL(page.url);
		newUrl.searchParams.set('settings', 'open');
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(newUrl, { replaceState: true, keepFocus: true, noScroll: true });
	}
</script>

<div class="relative z-2 flex w-full flex-col">
	<div class="flex items-center justify-between gap-4 p-3 font-semibold">
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

	<div class="flex w-full flex-col px-3">
		<!-- {#if G.integrations.isChatEnabled || G.integrations.isDonationEnabled} -->
		<div class="mb-3 flex shrink-0 gap-3" transition:slide>
			<!-- {#if G.integrations.isChatEnabled} -->
			<div
				class="group relative z-1 flex w-full flex-col justify-between overflow-hidden rounded-md bg-elevation-3/50 p-2 font-semibold shadow-sm ring ring-border backdrop-blur-md transition-colors duration-700"
			>
				<div class="text-sm text-muted-foreground">Обычный заказ</div>
				<div class="text-lg">{REQUEST_PREFIX} в чате</div>
				<div class="absolute inset-0 bg-muted opacity-0 transition-opacity group-hover:opacity-100">
					<button class="flex size-full items-center justify-center text-sm font-semibold">
						Отключить
					</button>
				</div>
			</div>
			<!-- {/if} -->
			<!-- {#if G.integrations.isDonationEnabled} -->
			<div
				class="relative z-1 flex w-full flex-col justify-between overflow-hidden rounded-md bg-elevation-3/50 p-2 font-semibold shadow-sm ring ring-border backdrop-blur-md transition-colors duration-700"
			>
				<div class="text-sm text-muted-foreground">Платный заказ</div>
				<div class="text-lg">
					{#if G.settings.isPaidTimerEnabled}
						{NumberFormatter.formatCurrency(G.settings.paidTimerPricePerMinute)}/мин
					{:else}
						{NumberFormatter.formatCurrency(G.settings.prioritizedVideoPrice)}
					{/if}
				</div>
			</div>
			<!-- {/if} -->
		</div>
		<!-- {/if} -->

		{#if G.settings.isPollEnabled}
			<div
				class="mb-3 w-full shrink-0 overflow-hidden rounded-md bg-elevation-3/30 shadow-sm ring ring-border backdrop-blur-md transition-colors duration-700"
				transition:slide|global
			>
				<Votes />
			</div>
		{/if}
	</div>
</div>
