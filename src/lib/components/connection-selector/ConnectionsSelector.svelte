<script lang="ts">
	import { page } from '$app/state';
	import IntegrationButton from '../IntegrationButton.svelte';
	import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
	import G from '$lib/stores/G.svelte';
	import DonatePayIntegrationButton from '../DonatePayIntegrationButton.svelte';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ConnectionIndicator from './components/ConnectionIndicator.svelte';
	import colors from 'tailwindcss/colors';
	import ConnectionToggler from './components/ConnectionToggler.svelte';

	const connections = $derived(
		G.integrationManager.integrations.toSorted((a, b) => {
			if (isLinked(a.data.id) && !isLinked(b.data.id)) return -1;
			if (!isLinked(a.data.id) && isLinked(b.data.id)) return 1;
			return 0;
		})
	);
	const connectedCount = $derived(connections.filter((c) => c.isOpen).length);

	function isLinked(providerId: string) {
		return page.data.accounts?.some((acc) => acc.providerId === providerId) ?? false;
	}

	function getShaderState() {
		if (G.integrationManager.isAnyConnected) return 'open';
		return 'closed';
	}
</script>

<Popover>
	<PopoverTrigger
		class="flex h-10 w-fit cursor-pointer items-center justify-between gap-2 rounded-lg border-2 border-input bg-elevation-1/40 px-3 py-2 whitespace-nowrap outline-input transition-all duration-300 outline-none select-none hover:border-neutral-500 focus-visible:border-neutral-500 focus-visible:bg-neutral-800 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground"
	>
		<div class="flex items-center gap-2">
			<h2 class="font-medium">Интеграции</h2>
			<div
				class="flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums data-[state=open]:bg-green-500/15 data-[state=open]:text-green-500"
				data-state={getShaderState()}
			>
				<ConnectionIndicator state={getShaderState()} color={colors.green[500]} />
				{connectedCount} / {connections.length}
			</div>
		</div>
		<ChevronDown class="size-5 text-muted-foreground" />
	</PopoverTrigger>

	<PopoverContent class="max-h-80 overflow-y-auto p-0">
		<div class="flex flex-col divide-y divide-border">
			{#each connections as connection (connection.data.id)}
				{#if isLinked(connection.data.id)}
					<ConnectionToggler integration={connection} />
				{:else if connection.data.shouldHandleApiKey}
					{#if connection.data.id === 'donatepay'}
						<div class="flex items-center justify-between bg-elevation-2 p-2">
							<DonatePayIntegrationButton integration={connection.data} />
						</div>
					{/if}
				{:else}
					<div class="flex items-center justify-between bg-elevation-2 p-2">
						<IntegrationButton integration={connection.data} />
					</div>
				{/if}
			{/each}
		</div>
	</PopoverContent>
</Popover>
