<script lang="ts">
	import DashedCircleIcon from '@lucide/svelte/icons/circle-dashed';
	import CheckIcon from '@lucide/svelte/icons/circle-check';
	import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';
	import appStore from '$lib/stores/AppStore.svelte';
	import { Spinner } from './ui/spinner';
	import type Integration from '$lib/stores/integrations/Integration.svelte';

	function toggleConnection(socket: Integration) {
		if (socket.isClosed) socket.connect();
		else if (socket.isOpen) socket.disconnect();
	}
</script>

<Select type="multiple">
	<SelectTrigger class="flex w-full" disabled={appStore.integrations.all.length < 1}>
		<div class="flex items-center gap-4">
			Очередь
			<div class="flex gap-2">
				{#each appStore.integrations.all as socket (socket.id)}
					<socket.icon
						class="data-[open=true]:{socket.color} {socket.color} transition-colors data-[open=false]:text-stone-500"
						data-open={socket.isOpen}
					/>
				{/each}
			</div>
		</div>
	</SelectTrigger>
	<SelectContent side="bottom">
		{#each appStore.integrations.all as socket (socket.id)}
			<SelectItem
				noCheckmark
				value={socket.id}
				disabled={socket.isConnecting}
				onclick={() => toggleConnection(socket)}
			>
				{#if socket.isConnecting}
					<Spinner />
				{:else if socket.isOpen}
					<CheckIcon class=" text-green-500" />
				{:else}
					<DashedCircleIcon />
				{/if}
				{socket.id}
			</SelectItem>
		{/each}
	</SelectContent>
</Select>
