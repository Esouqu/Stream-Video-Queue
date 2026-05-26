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

<div
	class="relative flex h-dvh justify-center overflow-hidden bg-[radial-gradient(circle,#1a1c23_0%,#0d0e12_70%,#050506_100%)]"
>
	<div class="relative m-4 flex w-full items-center gap-4 overflow-hidden">
		<VideoPlayer />
		<VideoQueue />
	</div>
</div>
<div class="absolute right-0 bottom-0">
	<DevTools />
</div>

<Settings />
