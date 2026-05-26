<script lang="ts">
	import { cn } from '$lib/utils';
	import { Switch } from './ui/switch';
	import type { SocketState } from '$lib/types';
	import { page } from '$app/state';
	import IntegrationButton from './IntegrationButton.svelte';
	import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
	import G from '$lib/stores/G.svelte';

	const connections = $derived(
		G.integrationManager.integrations.toSorted((a, b) => {
			return isLinked(b.data.id) ? 1 : -1;
		})
	);
	const connectedCount = $derived(connections.filter((c) => c.isOpen).length);

	function isLinked(providerId: string) {
		return page.data.accounts?.some((acc) => acc.providerId === providerId) ?? false;
	}

	// function handleRefresh(id: string) {
	// 	refreshingIds = new Set([...refreshingIds, id]);

	// 	connections = connections.map((conn) =>
	// 		conn.id === id ? { ...conn, status: 'connecting' as ConnectionStatus } : conn
	// 	);

	// 	setTimeout(() => {
	// 		connections = connections.map((conn) =>
	// 			conn.id === id ? { ...conn, status: 'connected' as ConnectionStatus } : conn
	// 		);
	// 		refreshingIds = new Set([...refreshingIds].filter((i) => i !== id));
	// 	}, 1500);
	// }

	function handleConnectAll(e: MouseEvent) {
		e.stopPropagation();
		G.integrationManager.connectAll();
	}

	function handleDisconnectAll(e: MouseEvent) {
		e.stopPropagation();
		G.integrationManager.disconnectAll();
	}

	const statusConfig: Record<SocketState, { color: string; pulse: boolean; title: string }> = {
		'not-exists': { title: 'Отключено', color: 'bg-muted-foreground', pulse: false },
		open: { title: 'Подключено', color: 'bg-green-500', pulse: false },
		closed: { title: 'Отключено', color: 'bg-muted-foreground', pulse: false },
		connecting: { title: 'Подключение...', color: 'bg-muted-foreground', pulse: true }
	};
</script>

<Popover>
	<PopoverTrigger
		class="flex h-10 w-72 cursor-pointer items-center justify-between gap-2 rounded-lg border-2 border-input bg-elevation-1/40 px-3 py-2 whitespace-nowrap outline-input transition-all duration-300 outline-none select-none hover:border-neutral-500 focus-visible:border-neutral-500 focus-visible:bg-neutral-800 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:rounded-b-none data-[state=open]:border-b-transparent [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground"
	>
		<span class="hidden sm:inline">
			Интеграции
			<span class="text-sm text-muted-foreground">
				{connectedCount} / {connections.length}
			</span>
		</span>

		<!-- <div class="flex gap-1">
			<Button
				variant="secondary"
				class="h-6 p-0"
				size="icon"
				tooltip="Подключить все"
				onclick={handleConnectAll}
			>
				<PowerIcon class="size-4.5 stroke-3" />
			</Button>
			<Button
				variant="secondary"
				class="h-6 p-0"
				size="icon"
				tooltip="Отключить все"
				onclick={handleDisconnectAll}
			>
				<PowerOffIcon class="size-4.5" />
			</Button>
		</div> -->
	</PopoverTrigger>

	<PopoverContent
		sideOffset={0}
		class="max-h-80 overflow-y-auto p-0 data-[side=bottom]:rounded-t-none"
	>
		<div class="flex flex-col divide-y divide-border">
			{#each connections as connection (connection.data.id)}
				{@const config = statusConfig[connection.state]}
				<!-- {@const isRefreshing = refreshingIds.has(connection.id)} -->
				<div class="flex items-center justify-between bg-elevation-2 p-2">
					{#if isLinked(connection.data.id)}
						<div class="grid grid-cols-[auto_1fr] items-center gap-2">
							<div
								class="flex aspect-square h-full items-center justify-center rounded bg-(--bg-color)/20 text-(--bg-color)"
								style="--bg-color: {connection.data.color};"
							>
								<connection.data.icon class="size-5" />
							</div>
							<div class="flex flex-col">
								<span class="text-sm font-medium text-popover-foreground"
									>{connection.data.name}</span
								>
								<div class="flex items-center gap-1.5">
									<span class="relative flex size-2">
										{#if config.pulse}
											<span
												class={cn(
													config.color,
													'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75'
												)}
											></span>
										{/if}
										<span class={cn(config.color, 'relative inline-flex size-2 rounded-full')}
										></span>
									</span>
									<span class="text-xs text-muted-foreground capitalize">{config.title}</span>
								</div>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<!-- <button
									type="button"
									class="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-50"
									onclick={() => handleRefresh(connection.id)}
									disabled={isRefreshing || !connection.enabled}
								>
									<RefreshCw class={cn('size-3.5', isRefreshing && 'animate-spin')} />
								</button> -->
							<Switch
								disabled={connection.isConnecting}
								bind:checked={
									() => connection.isOpen, () => G.integrationManager.toggle(connection.data.id)
								}
							/>
						</div>
					{:else}
						<IntegrationButton integration={connection.data} />
					{/if}
				</div>
			{/each}
		</div>
	</PopoverContent>
</Popover>
