<script lang="ts">
	import { dev } from '$app/environment';
	import G from '$lib/stores/G.svelte';
	import { toast } from 'svelte-sonner';
	import { Button, buttonVariants } from './ui/button';
	import { Input } from './ui/input';
	import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
	import ToolsIcon from '@lucide/svelte/icons/tool-case';
	import RandomColor from '$lib/stores/RandomColorStore';
	import { randInt } from '$lib/utils';

	type Props = {
		anchor?: HTMLElement;
	};

	const randomColor = new RandomColor();

	let message = $state('');
	let value = $state(100);
	let addAmount = $state(25);

	const { anchor }: Props = $props();

	function addMessage() {
		G.onSocketMessage({ name: 'dev', message, source: 'twitch', value });
		message = '';
	}

	function addWithInterval() {
		setInterval(async () => {
			const color = randomColor.get().array();
			const newItem = {
				channelTitle: 'Deko',
				title: 'iridescent prod. deko ✧･ﾟ: *✧･ﾟ:*  OFFICIAL VIDEO',
				thumbnail: 'https://i.ytimg.com/vi/ssXR5K2ZdrM/mqdefault.jpg',
				duration: '1:40',
				videoId: 'ssXR5K2ZdrM',
				viewCount: '590151',
				publishedAt: '2019-07-20T01:40:57Z',
				isLive: false,
				startSeconds: 0,
				message:
					'!rq https://www.youtube.com/watch?v=ssXR5K2ZdrM&list=RDssXR5K2ZdrM&start_radio=1&pp=oAcB',
				value: 0,
				isActive: false,
				submittedBy: ['esouqu'],
				color
			};
			try {
				await new Promise((resolve) => setTimeout(() => resolve(true), 50));
				await G.queue.enqueue(newItem);

				toast.message('Видео добавлено', {
					description: newItem.title
				});
			} catch (err) {
				toast.error('Не удалось добавить видео', {
					description: (err as Error).message
				});
			}
		}, 1000);
	}

	async function addMultiple() {
		for (let i = 0; i < addAmount; i++) {
			const color = randomColor.get().array();
			const newItem = {
				channelTitle: 'Deko',
				title: 'iridescent prod. deko ✧･ﾟ: *✧･ﾟ:*  OFFICIAL VIDEO',
				thumbnail: 'https://i.ytimg.com/vi/ssXR5K2ZdrM/mqdefault.jpg',
				duration: '1:40',
				videoId: 'ssXR5K2ZdrM',
				viewCount: '590151',
				publishedAt: '2019-07-20T01:40:57Z',
				isLive: false,
				startSeconds: 0,
				message:
					'!rq https://www.youtube.com/watch?v=ssXR5K2ZdrM&list=RDssXR5K2ZdrM&start_radio=1&pp=oAcB',
				value: Math.random() > 0.5 ? randInt(100, 1000) : 0,
				isActive: false,
				submittedBy: ['esouqu'],
				color
			};

			try {
				await new Promise((resolve) => setTimeout(() => resolve(true), 50));
				await G.queue.enqueue(newItem);

				toast.message('Видео добавлено', {
					description: newItem.title
				});
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
