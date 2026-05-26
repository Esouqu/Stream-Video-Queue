<script lang="ts">
	import { Button } from './ui/button';
	import type { IntegrationData } from '$lib/types';
	import { beforeNavigate, invalidateAll } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { page } from '$app/state';
	import { SETTINGS_URL } from '$lib/constants';

	interface Props {
		integration: IntegrationData;
	}

	const { integration }: Props = $props();

	let isDisabled = $state(false);

	const isLinked = $derived(
		page.data.accounts?.some((acc) => acc.providerId === integration.id) ?? false
	);
	const isLoggedIn = $derived(!!page.data.user);
	const isLastAccount = $derived(
		page.data.accounts?.length === 1 && page.data.accounts[0].providerId === integration.id
	);

	beforeNavigate(() => {
		isDisabled = true;
	});

	async function signInSocial() {
		if (!isLoggedIn) {
			await authClient.signIn.social({
				provider: integration.id,
				callbackURL: SETTINGS_URL
			});
		} else {
			await authClient.linkSocial({
				provider: integration.id,
				callbackURL: SETTINGS_URL
			});
		}
	}

	async function unlink() {
		if (isLastAccount) return;

		await authClient.unlinkAccount({
			providerId: integration.id
		});

		invalidateAll();
	}

	async function handleLinking() {
		if (isLinked) {
			isDisabled = true;
			await unlink();
			isDisabled = false;
		} else {
			signInSocial();
		}
	}
</script>

<Button
	class="group w-full items-start overflow-hidden hover:bg-green-900 hover:text-green-300 data-[linked=true]:bg-(--int-color)/20 data-[linked=true]:text-(--int-color) data-[linked=true]:hover:bg-red-900 data-[linked=true]:hover:text-red-300"
	style="--int-color: {integration.color};"
	data-linked={isLinked}
	disabled={isDisabled || isLastAccount}
	onclick={handleLinking}
>
	<div class="flex h-full flex-col transition-transform group-hover:-translate-y-full">
		<div class="flex h-full shrink-0 items-center justify-center gap-2">
			<integration.icon class="size-5" />
			{integration.name}
		</div>
		<div class="flex h-full shrink-0 items-center justify-center">
			{#if isLinked}
				Отключить
			{:else}
				Подключить
			{/if}
		</div>
	</div>
</Button>
