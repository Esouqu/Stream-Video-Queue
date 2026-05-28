<script lang="ts">
	import { Switch } from './ui/switch';
	import type { SocketState } from '$lib/types';
	import { page } from '$app/state';
	import IntegrationButton from './IntegrationButton.svelte';
	import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
	import G from '$lib/stores/G.svelte';
	import DonatePayIntegrationButton from './DonatePayIntegrationButton.svelte';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';

	const statusConfig: Record<SocketState, { color: string; pulse: boolean; title: string }> = {
		'not-exists': { title: 'Отключено', color: 'bg-muted-foreground', pulse: false },
		open: { title: 'Подключено', color: 'bg-green-500', pulse: false },
		closed: { title: 'Отключено', color: 'bg-muted-foreground', pulse: false },
		connecting: { title: 'Подключение...', color: 'bg-muted-foreground', pulse: true }
	};

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
		class="flex h-10 w-72 cursor-pointer items-center justify-between gap-2 rounded-lg border-2 border-input bg-elevation-1/40 px-3 py-2 whitespace-nowrap outline-input transition-all duration-300 outline-none select-none hover:border-neutral-500 focus-visible:border-neutral-500 focus-visible:bg-neutral-800 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:rounded-b-none data-[state=open]:border-b-transparent [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground"
	>
		<div class="flex items-center gap-2">
			<h2 class="font-medium text-neutral-200">Интеграции</h2>
			<div
				class="flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums data-[state=open]:bg-green-500/15 data-[state=open]:text-green-500"
				data-state={getShaderState()}
			>
				<span
					class="h-1.5 w-1.5 rounded-full bg-neutral-600 data-[state=open]:bg-green-500 data-[state=open]:shadow-[0_0_6px_rgba(52,211,153,0.6)]"
					data-state={getShaderState()}
				></span>
				{connectedCount} / {connections.length}
			</div>
		</div>
		<ChevronDown />
	</PopoverTrigger>

	<PopoverContent
		sideOffset={0}
		class="max-h-80 overflow-y-auto p-0 data-[side=bottom]:rounded-t-none"
	>
		<div class="flex flex-col divide-y divide-border">
			{#each connections as connection (connection.data.id)}
				{#if isLinked(connection.data.id)}
					<div
						class="group flex items-center justify-between bg-elevation-2 p-2"
						style="--accent-color: {connection.data.color};"
						data-state={connection.state}
					>
						<div class="grid grid-cols-[auto_1fr] items-center gap-2">
							<div
								class="flex aspect-square h-full items-center justify-center rounded text-muted-foreground group-data-[state=open]:bg-(--accent-color)/20 group-data-[state=open]:text-(--accent-color)"
							>
								<connection.data.icon class="size-5" />
							</div>
							<div class="flex flex-col">
								<span
									class="text-sm font-medium text-muted-foreground group-data-[state=open]:text-foreground"
								>
									{connection.data.name}
								</span>
								<!-- <div
									class="flex w-fit items-center gap-1.5 rounded-full bg-neutral-800 px-2 py-0.5 text-xs font-medium text-neutral-500 transition-all group-data-[state=open]:bg-(--accent-color)/15 group-data-[state=open]:text-(--accent-color)"
								>
									<span
										class="h-1.5 w-1.5 rounded-full bg-neutral-500 transition-colors group-data-[state=open]:bg-(--accent-color) group-data-[state=open]:shadow-[0_0_6px_rgba(52,211,153,0.5)]"
									></span>
									{statusConfig[connection.state].title}
								</div> -->
								<div class="flex items-center gap-1.5">
									<span class="relative flex size-2">
										{#if connection.state === 'connecting'}
											<span
												class="absolute inline-flex h-full w-full animate-ping rounded-full bg-muted-foreground opacity-75"
											></span>
										{/if}
										<span
											class="relative inline-flex size-2 rounded-full bg-muted-foreground data-[state=open]:bg-(--accent-color)"
											data-state={connection.state}
										></span>
									</span>
									<span class="text-xs text-muted-foreground capitalize"
										>{statusConfig[connection.state].title}</span
									>
								</div>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<Switch
								size="flattened"
								disabled={connection.isConnecting}
								bind:checked={
									() => connection.isOpen, () => G.integrationManager.toggle(connection.data.id)
								}
							/>
						</div>
					</div>
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
