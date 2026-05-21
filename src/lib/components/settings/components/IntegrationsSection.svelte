<script lang="ts">
	import ChatIntegration from '$lib/components/ChatIntegration.svelte';
	import TwitchIcon from '$lib/components/icons/TwitchIcon.svelte';
	import GalleryIcon from '$lib/components/icons/GalleryIcon.svelte';
	import DonatePayApiDialog from '$lib/components/DonatePayApiDialog.svelte';
	import donatePayApi from '$lib/api/donatePayApi.svelte';
	import donationAlertsApi from '$lib/api/donationalertsApi.svelte';
	import DonatePayIcon from '$lib/components/icons/DonatePayIcon.svelte';
	import DonationAlertsIcon from '$lib/components/icons/DonationAlertsIcon.svelte';
	import DonationIntegration from '$lib/components/DonationIntegration.svelte';
	import appStore from '$lib/stores/AppStore.svelte';

	let twitchChannel = $state('esouqu');
	let kickChannel = $state('esouqu');
	let isDialogOpen = $state(false);

	const integrations = $derived([
		{
			title: 'DonationAlerts',
			Icon: DonationAlertsIcon,
			isLoggedIn: !!donationAlertsApi.user,
			color: '#f57507',
			onLogout: () => {
				donationAlertsApi.logout();
				appStore.removeSocket('donationalerts');
			},
			onAuth: () => fetch('/api/donationalerts/auth')
		},
		{
			title: 'DonatePay',
			Icon: DonatePayIcon,
			isLoggedIn: !!donatePayApi.user,
			color: '#44AB4F',
			onLogout: () => {
				donatePayApi.logout();
				appStore.removeSocket('donatepay');
			},
			onAuth: () => {
				isDialogOpen = true;
			}
		}
	]);
</script>

<DonatePayApiDialog bind:isOpen={isDialogOpen} />

<div class="flex flex-col gap-2">
	<ChatIntegration title="Twitch" bind:channel={twitchChannel}>
		{#snippet icon()}
			<TwitchIcon class="inline size-5 text-violet-500" />
		{/snippet}
	</ChatIntegration>

	<ChatIntegration title="Kick" bind:channel={kickChannel}>
		{#snippet icon()}
			<GalleryIcon class="inline size-5 text-lime-500" />
		{/snippet}
	</ChatIntegration>

	{#each integrations as integration (integration.title)}
		<DonationIntegration {...integration}>
			{#snippet icon()}
				<integration.Icon class="inline size-5" color={integration.color} />
			{/snippet}
		</DonationIntegration>
	{/each}
</div>
