<script lang="ts">
	import appManager from '$lib/scripts/AppManager.svelte';
	import { onMount } from 'svelte';
	import YouTubePlayer from 'youtube-player';

	let playerElement: HTMLElement | undefined = $state();

	onMount(async () => {
		if (playerElement) {
			appManager.setYoutubePlayer(YouTubePlayer(playerElement, { playerVars: { rel: 0 } }));
		}
	});
</script>

<div
	class="relative aspect-video w-full overflow-hidden rounded-2xl bg-background shadow-[0_0_5rem_0_rgba(255_255_255_/_5%)]"
>
	<div class="absolute inset-0 h-full w-full" bind:this={playerElement}></div>
</div>
