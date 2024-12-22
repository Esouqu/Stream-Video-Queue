<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Button } from './ui/button';

	interface Props {
		title: string;
		username?: string;
		icon: Snippet;
		onAuth: () => void;
		onLogout: () => void;
	}

	const { title, username, icon, onAuth, onLogout }: Props = $props();
</script>

<div class="flex w-full items-center justify-center">
	{#if !username}
		<Button variant="outline" size="lg" onclick={onAuth}>
			{@render icon()}
			Авторизоваться
		</Button>
	{:else}
		<div class="flex w-full items-center justify-between gap-2">
			<div class="flex items-center gap-2">
				<!-- {@render icon()} -->
				<div>
					<h2 class="text-lg font-medium leading-none">{title}</h2>
					<span class="text-xs text-muted-foreground">
						Пользователь: {username}
					</span>
				</div>
			</div>
			<Button variant="outline" onclick={onLogout}>Выйти</Button>
		</div>
	{/if}
</div>
