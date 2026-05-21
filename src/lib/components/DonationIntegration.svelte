<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Button } from './ui/button';
	import IntegrationBase from './IntegrationBase.svelte';
	import CheckIcon from '@lucide/svelte/icons/check';

	interface Props {
		title: string;
		isLoggedIn: boolean;
		icon: Snippet;
		onAuth?: () => void;
		onLogout?: () => void;
	}

	const { title, isLoggedIn, icon, onAuth, onLogout }: Props = $props();

	let isHovered = $state(false);
</script>

<IntegrationBase>
	{#snippet titleSlot()}
		{@render icon()}
		{title}
	{/snippet}
	{#snippet inputSlot()}
		{#if isLoggedIn}
			<Button
				variant={isHovered ? 'destructive' : 'positive'}
				class="group w-full items-start overflow-hidden"
				onmouseenter={() => (isHovered = true)}
				onmouseleave={() => (isHovered = false)}
				onclick={onLogout}
			>
				<div class="flex h-full flex-col transition-transform group-hover:-translate-y-full">
					<div class="flex h-full shrink-0 items-center justify-center">
						<CheckIcon />
					</div>
					<div class="flex h-full shrink-0 items-center justify-center">Отключить</div>
				</div>
			</Button>
		{:else}
			<Button class="w-full" onclick={onAuth}>Подключить</Button>
		{/if}
	{/snippet}
</IntegrationBase>
