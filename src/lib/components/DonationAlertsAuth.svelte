<script lang="ts">
	import { goto } from '$app/navigation';
	import donationAlertsApi from '$lib/api/donationalertsApi.svelte';
	import AuthCard from './AuthCard.svelte';
	import DonationAlertsIcon from './icons/DonationAlertsIcon.svelte';
	import { Spinner } from './ui/spinner';

	function onLogout() {
		donationAlertsApi.logout();
	}

	function onAuth() {
		goto('/api/donationalerts/auth');
	}
</script>

{#snippet icon()}
	<DonationAlertsIcon color="#f57507" />
{/snippet}

{#await donationAlertsApi.user}
	<Spinner />
{:then user}
	<AuthCard title="DonationAlerts" username={user?.name} {icon} {onAuth} {onLogout} />
{/await}
