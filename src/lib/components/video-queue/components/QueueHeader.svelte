<script lang="ts">
	import appStore from '$lib/stores/AppStore.svelte';
	import { slide } from 'svelte/transition';
	import Settings from '$lib/components/settings/Settings.svelte';
	import { Toggle } from '$lib/components/ui/toggle';
	import VoteIcon from '$lib/components/icons/VoteIcon.svelte';
	import Votes from '$lib/components/votes/Votes.svelte';
	import NumberFormatter from '$lib/utils/NumberFormatter';
	import IntegrationSelector from '$lib/components/IntegrationSelector.svelte';
</script>

<div class="flex w-full flex-col bg-muted">
	<div class="flex items-center justify-between gap-4 p-3 font-semibold text-muted-foreground">
		<IntegrationSelector />
		<div class="flex">
			<Toggle size="icon" tooltip="Голосование" bind:pressed={appStore.poll.isEnabled}>
				<VoteIcon />
			</Toggle>
			<Settings />
		</div>
	</div>

	<div class="flex w-full flex-col px-3">
		{#if appStore.integrations.isChatEnabled || appStore.integrations.isDonationEnabled}
			<div class="mb-3 flex shrink-0 gap-3" transition:slide>
				{#if appStore.integrations.isChatEnabled}
					<div
						class="pointer-events-auto relative flex w-full flex-col justify-between overflow-hidden rounded-md border bg-elevation-3 p-2 font-semibold shadow-sm transition-colors duration-700"
					>
						<div class="text-sm text-muted-foreground">Обычный заказ</div>
						<div class="text-lg">!rq в чате</div>
					</div>
				{/if}
				{#if appStore.integrations.isDonationEnabled}
					<div
						class="pointer-events-auto relative flex w-full flex-col justify-between overflow-hidden rounded-md border bg-elevation-3 p-2 font-semibold shadow-sm transition-colors duration-700"
					>
						<div class="text-sm text-muted-foreground">Приоритетный заказ</div>
						<div class="text-lg">
							{#if appStore.paidTimerEnabled}
								{NumberFormatter.formatCurrency(appStore.paidTimerPricePerMinute)}/мин
							{:else}
								{NumberFormatter.formatCurrency(appStore.prioritizedVideoPrice)}
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/if}

		{#if appStore.poll.isEnabled}
			<div class="mb-3 shrink-0" transition:slide|global>
				<Votes
					class="pointer-events-auto w-full overflow-hidden rounded-md border bg-elevation-3 p-2 shadow-sm transition-colors duration-700"
				/>
			</div>
		{/if}
	</div>
</div>
