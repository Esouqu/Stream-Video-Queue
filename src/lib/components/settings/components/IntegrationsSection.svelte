<script lang="ts">
	import DonatePayApiDialog from '$lib/components/DonatePayApiDialog.svelte';
	import IntegrationButton from '$lib/components/IntegrationButton.svelte';
	import G from '$lib/stores/G.svelte';
	import { AVAILABLE_PROVIDERS } from '$lib/providers';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { authClient } from '$lib/auth-client';
	import { invalidateAll } from '$app/navigation';
	import { SETTINGS_URL } from '$lib/constants';

	const abailableProviders = $derived(AVAILABLE_PROVIDERS.filter((p) => p.id !== 'donatepay'));
	const isLoggedIn = $derived(!!page.data.user);
	const isSingleAccount = $derived(page.data.accounts?.length === 1);

	function isLinked(providerId: string) {
		return page.data.accounts?.some((acc) => acc.providerId === providerId) ?? false;
	}

	async function unlink(providerId: string) {
		if (isSingleAccount) {
			await authClient.signOut();
		} else {
			await authClient.unlinkAccount({
				providerId
			});
		}

		invalidateAll();
	}

	async function signInSocial(providerId: string) {
		if (!isLoggedIn) {
			await authClient.signIn.social({
				provider: providerId,
				callbackURL: SETTINGS_URL
			});
		} else {
			await authClient.linkSocial({
				provider: providerId,
				callbackURL: SETTINGS_URL
			});
		}
	}
</script>

<DonatePayApiDialog bind:isOpen={G.isDonatePayApiKeyDialogOpen} />

<form method="POST" action="?/signInSocial" use:enhance>
	<div class="grid grid-cols-2 gap-2">
		{#each abailableProviders as integration (integration.id)}
			<IntegrationButton
				{integration}
				onLink={signInSocial}
				onUnlink={unlink}
				isLinked={isLinked(integration.id)}
			/>
		{/each}
	</div>
	{#if page.form?.error}
		<span>{page.form.error}</span>
	{/if}
</form>
