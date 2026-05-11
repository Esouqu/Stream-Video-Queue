<script lang="ts">
	import { dev } from '$app/environment';
	import appStore from '$lib/stores/AppStore.svelte';
	import { Button, buttonVariants } from './ui/button';
	import { Input } from './ui/input';
	import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
	import ToolsIcon from '@lucide/svelte/icons/tool-case';

	type Props = {
		anchor?: HTMLElement;
	};

	let message = $state('');

	const { anchor }: Props = $props();

	function addMessage() {
		appStore.onChatMessage('esouqu', { username: 'esouqu' }, message);
		message = '';
	}
</script>

{#if dev}
	<Popover>
		<PopoverTrigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
			<ToolsIcon />
		</PopoverTrigger>
		<PopoverContent class="w-100 bg-muted" customAnchor={anchor} side="left" align="start">
			<div class="space-y-2">
				<div class="font-semibold">Чат</div>
				<div class="flex w-full items-center">
					<Input placeholder="Сообщение" bind:value={message} onenter={addMessage} />
					<Button variant="ghost" class="ml-auto" onclick={addMessage}>Отправить</Button>
				</div>
			</div>
		</PopoverContent>
	</Popover>
{/if}
