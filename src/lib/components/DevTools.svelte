<script lang="ts">
	import { dev } from '$app/environment';
	import G from '$lib/stores/G.svelte';
	import { toast } from 'svelte-sonner';
	import { Button, buttonVariants } from './ui/button';
	import { Input } from './ui/input';
	import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
	import ToolsIcon from '@lucide/svelte/icons/tool-case';
	import { randInt } from '$lib/utils';

	type Props = {
		anchor?: HTMLElement;
	};

	let message = $state(
		'!rq https://www.youtube.com/watch?v=ssXR5K2ZdrM&list=RDssXR5K2ZdrM&start_radio=1&pp=oAcB'
	);
	let value = $state(100);
	let addAmount = $state(25);

	const { anchor }: Props = $props();

	function addMessage() {
		G.onSocketMessage({ name: 'dev', message, source: 'twitch', value });
		message = '';
	}

	function addWithInterval() {
		setInterval(async () => {
			const val = Math.random() > 0.5 ? randInt(100, 1000) : 0;
			await new Promise((resolve) => setTimeout(() => resolve(true), 50));

			try {
				G.queueManager.addVideo('esouqu', message, val);
			} catch (err) {
				toast.error('Не удалось добавить видео', {
					description: (err as Error).message
				});
			}
		}, 1000);
	}

	async function addMultiple() {
		for (let i = 0; i < addAmount; i++) {
			const val = Math.random() > 0.5 ? randInt(100, 1000) : 0;
			// await new Promise((resolve) => setTimeout(() => resolve(true), 50));

			try {
				G.queueManager.addVideo('esouqu', message, val);
			} catch (err) {
				toast.error('Не удалось добавить видео', {
					description: (err as Error).message
				});
			}
		}
	}
</script>

{#if dev}
	<Popover>
		<PopoverTrigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
			<ToolsIcon />
		</PopoverTrigger>
		<PopoverContent class="w-100 bg-muted" customAnchor={anchor} side="top" align="end">
			<div class="space-y-2">
				<div class="font-semibold">Чат</div>
				<div class="flex w-full items-center">
					<Input type="number" placeholder="Сумма" bind:value />
					<Input placeholder="Сообщение" bind:value={message} onenter={addMessage} />
					<Button variant="ghost" class="ml-auto" onclick={addMessage}>Отправить</Button>
				</div>
			</div>
			<div class="space-y-2">
				<div class="flex w-full flex-col items-center">
					<Input type="number" placeholder="Сумма" class="shrink-0" bind:value={addAmount} />
					<div class="flex gap-2">
						<Button variant="ghost" class="ml-auto" onclick={addMultiple}>Добавить</Button>
						<Button variant="ghost" class="ml-auto" onclick={addWithInterval}>
							Добававлять с интервалом
						</Button>
					</div>
				</div>
			</div>
		</PopoverContent>
	</Popover>
{/if}
