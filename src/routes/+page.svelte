<script lang="ts">
	import VideoQueue from '$lib/components/video-queue/VideoQueue.svelte';
	import VideoPlayer from '$lib/components/VideoPlayer.svelte';
	import appStore from '$lib/stores/AppStore.svelte';
</script>

<svelte:head>
	{#if appStore.queue.current}
		<title>{appStore.queue.current.title}</title>
	{/if}
</svelte:head>

<div class="relative flex h-dvh justify-center overflow-hidden">
	<div class="m-4 flex max-h-[calc(100vh-2rem)] w-full flex-col justify-center">
		{#if appStore.queue.current}
			<VideoPlayer />
		{/if}
	</div>
	<VideoQueue />
</div>
