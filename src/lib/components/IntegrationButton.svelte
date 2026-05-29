<script lang="ts">
	import { Button } from './ui/button';
	import type { IntegrationData } from '$lib/types';
	import { beforeNavigate, invalidateAll } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { page } from '$app/state';
	import { SETTINGS_URL } from '$lib/constants';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogTrigger
	} from './ui/alert-dialog';
	import { cn } from 'tailwind-variants';
	import { badgeVariants } from './ui/badge';
	import { Input } from './ui/input';
	import type { Snippet } from 'svelte';

	interface Props {
		integration: IntegrationData;
		signIn?: () => Promise<void>;
		link?: (apiKey: string) => Promise<void>;
		unlink?: () => Promise<void>;
		apiKeyDescription?: Snippet;
	}

	const { integration, signIn, link, unlink, apiKeyDescription }: Props = $props();

	let apiKeyInput = $state('');
	let isDisabled = $state(false);
	let isDialogOpen = $state(false);

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
		const isApiKeyRequired = integration.shouldHandleApiKey;

		if (isApiKeyRequired && !signIn && !link) {
			throw new Error(
				'signIn() and link() methods should be provided if integration.shouldHandleApiKey is true'
			);
		}

		if (!isLoggedIn) {
			if (signIn) return await signIn();

			await authClient.signIn.social({
				provider: integration.id,
				callbackURL: SETTINGS_URL
			});
		} else {
			if (link) return await link(apiKeyInput);

			await authClient.linkSocial({
				provider: integration.id,
				callbackURL: SETTINGS_URL
			});
		}
	}

	async function unlinkAccount() {
		if (isLastAccount) return;

		if (unlink) {
			await unlink();
		} else {
			await authClient.unlinkAccount({
				providerId: integration.id
			});
		}

		invalidateAll();
	}

	async function closeDialog() {
		isDisabled = true;
		await handleLinking();
		isDisabled = false;

		isDialogOpen = false;
		apiKeyInput = '';
	}

	async function openDialog() {
		if (isLinked) {
			isDisabled = true;
			await unlinkAccount();
			isDisabled = false;
		} else {
			isDialogOpen = true;
		}
	}

	async function handleLinking() {
		if (isLinked) {
			isDisabled = true;
			await unlinkAccount();
			isDisabled = false;
		} else {
			await signInSocial();
		}
	}
</script>

{#if integration.shouldHandleApiKey}
	<AlertDialog bind:open={isDialogOpen}>
		<AlertDialogTrigger>
			{#snippet child({ props })}
				<Button
					{...props}
					class="group w-full items-start overflow-hidden hover:bg-green-900 hover:text-green-300 data-[linked=true]:bg-(--int-color)/20 data-[linked=true]:text-(--int-color) data-[linked=true]:hover:bg-red-900 data-[linked=true]:hover:text-red-300"
					style="--int-color: {integration.color};"
					data-linked={isLinked}
					disabled={isDisabled || isLastAccount || !isLoggedIn}
					onclick={openDialog}
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
			{/snippet}
		</AlertDialogTrigger>
		<AlertDialogContent class="w-lg p-4">
			<AlertDialogHeader class="p-0 text-start">
				<AlertDialogTitle>{integration.name} API ключ</AlertDialogTitle>
				{#if apiKeyDescription}
					<AlertDialogDescription>
						{@render apiKeyDescription?.()}
					</AlertDialogDescription>
				{/if}
			</AlertDialogHeader>
			<div class="space-y-4">
				<div class="space-y-2">
					<span class={cn(badgeVariants({ variant: 'destructive' }), 'text-sm')}>
						Никому не показывайте свой API ключ
					</span>
					<Input
						id="{integration.id}-api-key"
						type="password"
						class="w-full"
						placeholder="Введите API ключ"
						bind:value={apiKeyInput}
					/>
				</div>
				<div class="flex items-center gap-4 justify-self-end">
					<AlertDialogAction disabled={isDisabled || !apiKeyInput} onclick={closeDialog}>
						Сохранить
					</AlertDialogAction>
				</div>
			</div>
		</AlertDialogContent>
	</AlertDialog>
{:else}
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
{/if}
