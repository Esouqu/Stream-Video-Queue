<script lang="ts">
	import ChatIntegration from '$lib/components/ChatIntegration.svelte';
	import GalleryIcon from '$lib/components/icons/GalleryIcon.svelte';
	import DonatePayApiDialog from '$lib/components/DonatePayApiDialog.svelte';
	import DonationIntegration from '$lib/components/DonationIntegration.svelte';
	import appStore from '$lib/stores/AppStore.svelte';
	import TwitchIcon2 from '$lib/components/icons/TwitchIcon2.svelte';

	function updateIntegrations() {
		// appStore.integrations.close();
		appStore.integrations.update();
	}
</script>

<DonatePayApiDialog bind:isOpen={appStore.isDonatePayApiKeyDialogOpen} />

<div class="flex flex-col gap-2">
	<ChatIntegration title="Twitch" bind:channel={appStore.twitchChannel}>
		{#snippet icon()}
			<TwitchIcon2 class="inline size-5 text-violet-500" />
		{/snippet}
	</ChatIntegration>

	<ChatIntegration title="Kick" bind:channel={appStore.kickChannel}>
		{#snippet icon()}
			<GalleryIcon class="inline size-5 text-lime-500" />
		{/snippet}
	</ChatIntegration>

	{#each appStore.integrations.donations as integration (integration.title)}
		<DonationIntegration isLoggedIn={false} {...integration}>
			{#snippet icon()}
				<integration.icon class="inline size-5 {integration.color}" />
			{/snippet}
		</DonationIntegration>
	{/each}
</div>
