<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Button } from './ui/button';

	interface Props {
		title: string;
		username?: string;
		icon: Snippet;
		onAuth?: () => void;
		onLogout?: () => void;
	}

	const { title, username, icon, onAuth, onLogout }: Props = $props();
</script>

<div class="flex w-full items-center">
	{#if !username}
		<Button size="lg" class="w-full" onclick={onAuth}>
			{@render icon()}
			Авторизоваться
		</Button>
	{:else}
		<div class="flex w-full justify-between">
			<div class="flex flex-col">
				<div class="font-semibold">{title}</div>
				<div class="text-sm text-muted-foreground">{username}</div>
			</div>
			<div class="flex items-center">
				<Button variant="ghost" onclick={onLogout}>Выйти</Button>
			</div>
		</div>
	{/if}
</div>
