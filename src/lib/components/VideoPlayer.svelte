<script lang="ts">
	import appManager from '$lib/scripts/AppManager.svelte';
	import { onMount } from 'svelte';
	import YouTubePlayer from 'youtube-player';
	import Votes from './Votes.svelte';

	let playerElement: HTMLElement | undefined = $state();

	onMount(async () => {
		if (playerElement) {
			appManager.setYoutubePlayer(YouTubePlayer(playerElement, { playerVars: { rel: 0 } }));
		}
	});
</script>

<div
	class="group relative aspect-video w-full overflow-hidden rounded-2xl bg-background shadow-[0_4px_6px_hsl(0deg_0%_0%_/_15%)]"
>
	<div class="absolute inset-0 h-full w-full" bind:this={playerElement}></div>
</div>
