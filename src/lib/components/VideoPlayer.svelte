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

<div class="youtube-player-container border">
	<div class="youtube-player" bind:this={playerElement}></div>
</div>

<style lang="scss">
	.youtube-player {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		width: 100%;
		height: 100%;

		&-container {
			position: relative;
			border-radius: 1rem;
			width: 100%;
			aspect-ratio: 16 / 9;
			box-shadow: 0 0 5rem 0px rgba(255 255 255 / 5%);
			background-color: hsl(var(--background));
			overflow: hidden;
		}
	}
</style>
