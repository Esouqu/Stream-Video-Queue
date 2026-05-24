<script lang="ts">
	import DevTools from '$lib/components/DevTools.svelte';
	import Settings from '$lib/components/settings/Settings.svelte';
	import VideoQueue from '$lib/components/video-queue/VideoQueue.svelte';
	import VideoPlayer from '$lib/components/VideoPlayer.svelte';
	import G from '$lib/stores/G.svelte';
</script>

<svelte:head>
	{#if G.queueManager.current}
		<title>{G.queueManager.current.title}</title>
	{/if}
</svelte:head>

<div class="relative flex h-dvh justify-center overflow-hidden">
	<div class="relative m-4 flex max-h-[calc(100vh-2rem)] w-full flex-col justify-center">
		<VideoPlayer />
		<div class="absolute right-0 bottom-0">
			<DevTools />
		</div>
	</div>
	<VideoQueue />
</div>

<Settings />
