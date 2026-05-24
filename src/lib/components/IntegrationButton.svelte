<script lang="ts">
	import { Button } from './ui/button';
	import type { IntegrationData } from '$lib/types';
	import { beforeNavigate } from '$app/navigation';

	interface Props {
		integration: IntegrationData;
		isLinked: boolean;
		onLink: (provider: string) => Promise<void>;
		onUnlink: (provider: string) => Promise<void>;
	}

	const { integration, isLinked, onLink, onUnlink }: Props = $props();

	let isNavigating = $state(false);
	let isUnlinking = $state(false);

	beforeNavigate(() => {
		isNavigating = true;
	});

	async function handleLinking() {
		if (isLinked) {
			isUnlinking = true;
			await onUnlink(integration.id);
			isUnlinking = false;
		} else {
			onLink(integration.id);
		}
	}
</script>

<Button
	class="group w-full items-start overflow-hidden hover:bg-green-900 hover:text-green-300 data-[linked=true]:bg-(--int-color)/20 data-[linked=true]:text-(--int-color) data-[linked=true]:hover:bg-red-900 data-[linked=true]:hover:text-red-300"
	style="--int-color: {integration.color};"
	data-linked={isLinked}
	disabled={isNavigating || isUnlinking}
	onclick={handleLinking}
>
	<div class="flex h-full flex-col transition-transform group-hover:-translate-y-full">
		<div class="flex h-full shrink-0 items-center justify-center gap-2">
			<integration.icon class="size-5" />
			{integration.name}
		</div>
		<div class="flex h-full shrink-0 items-center justify-center">
			{#if isLinked}
				Отключить
			{:else}
				Подключить
			{/if}
		</div>
	</div>
</Button>
