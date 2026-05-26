<script lang="ts">
	import DonatePayApiDialog from '$lib/components/DonatePayApiDialog.svelte';
	import IntegrationButton from '$lib/components/IntegrationButton.svelte';
	import G from '$lib/stores/G.svelte';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { authClient } from '$lib/auth-client';
	import ImageLoader from '$lib/components/ImageLoader.svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { invalidateAll } from '$app/navigation';

	let isDonatePayApiKeyDialogOpen = $state(false);

	async function onSignOut() {
		await authClient.signOut();
		invalidateAll();
	}
</script>

<DonatePayApiDialog bind:isOpen={isDonatePayApiKeyDialogOpen} />

<Card>
	{#if page.data.user}
		<CardHeader class="flex flex-row items-start justify-between gap-4">
			<div class="flex gap-2">
				<ImageLoader class="size-10" src={page.data.user.image} alt="avatar" />
				<div>
					<CardTitle class="flex gap-2">
						<div>{page.data.user.name}</div>
					</CardTitle>
					<CardDescription>
						{page.data.user.email}
					</CardDescription>
				</div>
			</div>
			<Button variant="ghost" onclick={onSignOut}>Выйти</Button>
		</CardHeader>
	{/if}
	<CardContent class="grid grid-cols-2 gap-4 space-y-0">
		{#each G.integrationManager.integrations as integration (integration.data.id)}
			<IntegrationButton integration={integration.data} />
		{/each}
	</CardContent>
</Card>
