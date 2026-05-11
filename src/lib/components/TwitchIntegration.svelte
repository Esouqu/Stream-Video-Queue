<script lang="ts">
	import appStore from '$lib/stores/AppStore.svelte';
	import type { Snippet } from 'svelte';
	import { Toggle } from './ui/toggle';
	import VoteIcon from './icons/VoteIcon.svelte';
	import Settings from './settings/Settings.svelte';
	import DevTools from './DevTools.svelte';

	type Props = {
		children?: Snippet;
	};

	let containerRef = $state<HTMLDivElement>();

	const { children }: Props = $props();
</script>

<div
	class="flex h-full w-full shrink-0 flex-col items-center overflow-hidden rounded-md bg-muted shadow-sm"
	bind:this={containerRef}
>
	<div class="flex w-full flex-col justify-between gap-2 p-1">
		<div class="flex items-center justify-between px-2 font-semibold text-muted-foreground">
			<div>
				<Toggle size="icon" tooltip="Голосование" bind:pressed={appStore.poll.isEnabled}>
					<VoteIcon />
				</Toggle>
			</div>
			Очередь ({appStore.twitchQueue.size})
			<Settings />
			<div class="flex">
				<DevTools anchor={containerRef} />
			</div>
		</div>
		<!-- <div class="flex gap-2">
			<div
				class="relative flex w-full items-center gap-2 rounded-t-lg bg-elevation-2 px-4 py-2 font-semibold text-muted-foreground"
			>
				<TwitchIcon class="size-5" />
				Чат
				<Badge class="bg-input text-foreground">
					{appStore.twitchQueue.size}
				</Badge>
			</div>
			<div
				class="relative flex w-full items-center gap-4 px-4 py-2 font-semibold text-muted-foreground"
			>
				<DonationAlertsIcon class="size-5" />
				Донаты
				<Badge class="absolute right-4 bg-input text-sm text-foreground">0</Badge>
			</div>
		</div> -->
	</div>

	<div class="relative flex h-full w-full flex-col overflow-hidden">
		{@render children?.()}
	</div>
</div>
