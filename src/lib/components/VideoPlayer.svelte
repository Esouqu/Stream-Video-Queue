<script lang="ts">
	import G from '$lib/stores/G.svelte';
	import { onMount } from 'svelte';
	import { Spinner } from './ui/spinner';
	import { Button } from './ui/button';
	import { fade } from 'svelte/transition';
	import NumberFormatter from '$lib/utils/NumberFormatter';

	let playerElement = $state<HTMLDivElement>();

	const shouldShowWarning = $derived(G.autoSkipTimer.isRunning);
	const formattedTime = $derived(
		NumberFormatter.formatTimerValue(G.autoSkipTimer.current, {
			onlySeconds: true
		})
	);

	onMount(() => {
		if (playerElement) {
			G.youtubePlayer.initialize(playerElement);
		}

		return () => G.youtubePlayer.destroy();
	});

	$effect(() => {
		if (G.queueManager.current) {
			const { videoId, startSeconds } = G.queueManager.current;
			G.youtubePlayer.load(videoId, startSeconds);
		} else {
			G.youtubePlayer.stop();
		}
	});

	function clearWarning(e: MouseEvent) {
		e.stopPropagation();
		G.autoSkipTimer.reset();
		G.youtubePlayer.play();
	}
</script>

<div
	class="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/8 bg-elevation-2 shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
>
	{#if !G.youtubePlayer.isReady && !G.youtubePlayer.error}
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
			<div>
				<span class="font-semibold text-muted-foreground">Автопропуск через</span>
				<span class="font-semibold tabular-nums">{formattedTime}</span>
			</div>
			<Button variant="secondary" class="mt-4" onclick={clearWarning}>Оставить видео</Button>
		</div>
	{/if}
	<div class="size-full" bind:this={playerElement}></div>
</div>
