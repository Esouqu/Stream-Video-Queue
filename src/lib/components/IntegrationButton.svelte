<script lang="ts">
	import { Button } from './ui/button';
	import type { IntegrationData } from '$lib/types';
	import { beforeNavigate } from '$app/navigation';

	interface Props {
		integration: IntegrationData;
		isLinked: boolean;
		onLink: (provider: string) => Promise<void>;
		onUnlink: (provider: string) => Promise<void>;
	}

	const { integration, isLinked, onLink, onUnlink }: Props = $props();

	let isHovered = $state(false);
	let isNavigating = $state(false);
	let isUnlinking = $state(false);

	beforeNavigate(() => {
		isNavigating = true;
	});
</script>

{#if isLinked}
	<Button
		type="submit"
		formaction="?/signOut"
		variant={isHovered ? 'destructive' : 'default'}
		class="group w-full items-start overflow-hidden bg-(--int-color)/20 text-(--int-color)"
		style="--int-color: {integration.color};"
		disabled={isNavigating || isUnlinking}
		onmouseenter={() => (isHovered = true)}
		onmouseleave={() => (isHovered = false)}
		onclick={async () => {
			isUnlinking = true;
			await onUnlink(integration.id);
			isUnlinking = false;
		}}
	>
		<div class="flex h-full flex-col transition-transform group-hover:-translate-y-full">
			<div class="flex h-full shrink-0 items-center justify-center gap-2">
				<integration.icon class="size-5" />
				{integration.name}
			</div>
			<div class="flex h-full shrink-0 items-center justify-center">Отключить</div>
		</div>
	</Button>
{:else}
	<Button
		formaction="?/signInSocial"
		variant={isHovered ? 'positive' : 'default'}
		class="group w-full items-start overflow-hidden"
		disabled={isNavigating}
		onmouseenter={() => (isHovered = true)}
		onmouseleave={() => (isHovered = false)}
		onclick={() => onLink(integration.id)}
	>
		<div class="flex h-full flex-col transition-transform group-hover:-translate-y-full">
			<div class="flex h-full shrink-0 items-center justify-center gap-2">
				<integration.icon class="size-5" />
				{integration.name}
			</div>
			<div class="flex h-full shrink-0 items-center justify-center">Подключить</div>
		</div>
	</Button>
{/if}
