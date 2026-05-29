<script lang="ts">
	import { Switch } from '$lib/components/ui/switch';
	import ConnectionIndicator from './ConnectionIndicator.svelte';
	import type Integration from '$lib/stores/Integration.svelte';
	import G from '$lib/stores/G.svelte';

	type Props = {
		integration: Integration;
	};

	const { integration }: Props = $props();
</script>

<div
	class="group flex items-center justify-between bg-elevation-2 p-2"
	style="--toggler-color: {integration.data.color};"
	data-state={integration.state}
>
	<div class="grid grid-cols-[auto_1fr] items-center gap-2">
		<div
			class="flex aspect-square h-full items-center justify-center rounded text-muted-foreground group-data-[state=open]:bg-(--toggler-color)/20 group-data-[state=open]:text-(--toggler-color)"
		>
			<integration.data.icon class="size-5" />
		</div>
		<div class="flex flex-col">
			<span
				class="text-sm font-medium text-muted-foreground group-data-[state=open]:text-foreground"
			>
				{integration.data.name}
			</span>

			<ConnectionIndicator state={integration.state} color={integration.data.color} withTitle />
		</div>
	</div>
	<div class="flex items-center gap-2">
		<Switch
			size="flattened"
			disabled={integration.isConnecting}
			bind:checked={
				() => integration.isOpen, () => G.integrationManager.toggle(integration.data.id)
			}
		/>
	</div>
</div>
