<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from 'svelte-sonner';
	import { TooltipProvider } from '$lib/components/ui/tooltip';
	import donationAlertsApi from '$lib/api/donationalertsApi.svelte';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import DonationAlertsSocket from '$lib/stores/DonationAlertsSocket.svelte';
	import appStore from '$lib/stores/AppStore.svelte';

	let { children } = $props();

	onMount(() => {
		if (browser) fetchUser();
	});

	async function fetchUser() {
		const user = await donationAlertsApi.getUser();

		if (user) {
			const donationAlertsSocket = new DonationAlertsSocket({
				roomId: user.id,
				socketToken: user.socket_connection_token
			});

			donationAlertsApi.setUser(user);
			appStore.addSocket(donationAlertsSocket);
		}

		// const twitchSocket = new TwitchChatSocket({ roomId: '' });
		// appStore.addSocket(twitchSocket);
		// const kickSocket = new KickChatSocket({ roomId: '' });
		// appStore.addSocket(kickSocket);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>StreamQueue</title>
</svelte:head>

<Toaster richColors closeButton />
<TooltipProvider disableHoverableContent ignoreNonKeyboardFocus delayDuration={500}>
	{@render children()}
</TooltipProvider>
