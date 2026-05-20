<script lang="ts">
	import appStore from '$lib/stores/AppStore.svelte';
	import { onMount, untrack } from 'svelte';
	import { Spinner } from './ui/spinner';
	import { msToHHMMSS } from '$lib/utils';
	import { Button } from './ui/button';
	import { fade } from 'svelte/transition';

	let playerElement = $state<HTMLDivElement>();

	const shouldShowWarning = $derived(
		appStore.poll.isEnoughVotes && appStore.autoSkipTimer.isRunning
	);

	onMount(() => {
		if (playerElement) {
			appStore.youtubePlayer.initialize(playerElement);
		}

		return () => appStore.youtubePlayer.destroy();
	});

	$effect(() => {
		if (appStore.queue.current) {
			appStore.loadVideo(appStore.queue.current);

			untrack(() => {
				appStore.poll.reset();
				appStore.autoSkipTimer.reset();
			});
		} else {
			appStore.youtubePlayer.stop();
		}
	});

	function clearWarning(e: MouseEvent) {
		e.stopPropagation();
		appStore.resumeVideo();
	}
</script>

<div
	class="relative aspect-video w-full overflow-hidden rounded-2xl bg-elevation-2 shadow-[0_0_20px_rgb(255_255_255/10%)]"
>
	{#if !appStore.youtubePlayer.isReady && !appStore.youtubePlayer.error}
		<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
			<Spinner class="size-20" />
		</div>
	{/if}
	{#if shouldShowWarning}
		<div
			class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/90"
			transition:fade
		>
			<div class="text-xl font-semibold">Видео будет пропущено</div>
			<div class="font-semibold text-muted-foreground tabular-nums">
				Автопропуск через {msToHHMMSS(appStore.autoSkipTimer.current)} сек.
			</div>
			<Button variant="secondary" class="mt-4" onclick={clearWarning}>Оставить видео</Button>
		</div>
	{/if}
	<div class="size-full" bind:this={playerElement}></div>
</div>
