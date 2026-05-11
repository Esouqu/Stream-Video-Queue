<script lang="ts">
	import DonationQueue from '$lib/components/multiqueue/DonationQueue.svelte';
	import VideoPlayer from '$lib/components/VideoPlayer.svelte';
	import appStore from '$lib/stores/AppStore.svelte';
</script>

<svelte:head>
	{#if appStore.twitchQueue.current}
		<title>{appStore.twitchQueue.current.title}</title>
	{/if}
</svelte:head>

<div class="relative flex h-dvh justify-center overflow-hidden">
	<div class="m-4 flex max-h-[calc(100vh-2rem)] w-full flex-col justify-center">
		{#if appStore.twitchQueue.current}
			<VideoPlayer />
		{/if}
	</div>
	<DonationQueue />
</div>
