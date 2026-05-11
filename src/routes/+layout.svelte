<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from 'svelte-sonner';
	import { TooltipProvider } from '$lib/components/ui/tooltip';
	import donationAlertsApi from '$lib/api/donationalertsApi.svelte';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let { children } = $props();

	onMount(() => {
		if (browser) fetchUser();
	});

	async function fetchUser() {
		const user = await donationAlertsApi.getUser();

		if (user) {
			// const donationAlertsSocket = new DonationAlertsSocket({
			// 	id: user.id,
			// 	socketToken: user.socket_connection_token
			// });

			donationAlertsApi.setUser(user);
			// appManager.addSocket(donationAlertsSocket);
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>StreamQueue</title>
</svelte:head>

<Toaster richColors closeButton />
<TooltipProvider disableHoverableContent delayDuration={500}>
	{@render children()}
</TooltipProvider>
