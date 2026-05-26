<script lang="ts">
	import { dev } from '$app/environment';
	import G from '$lib/stores/G.svelte';
	import { toast } from 'svelte-sonner';
	import { Button, buttonVariants } from './ui/button';
	import { Input } from './ui/input';
	import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
	import ToolsIcon from '@lucide/svelte/icons/tool-case';
	import { randInt } from '$lib/utils';
	import { Switch } from './ui/switch';

	type Props = {
		anchor?: HTMLElement;
	};

	const sectionStyles = 'w-full rounded-lg border bg-elevation-3 p-2';

	const { anchor }: Props = $props();

	let message = $state(
		'!rq https://www.youtube.com/watch?v=ssXR5K2ZdrM&list=RDssXR5K2ZdrM&start_radio=1&pp=oAcB'
	);
	let addAmount = $state(25);
	let isPaid = $state(false);
	let isSimulationPressed = $state(false);
	let withInterval = $state(false);

	function addMessage() {
		const value = isPaid ? 100 : 0;

		G.__sendDevMessage(message, value);
		message = '';
	}

	async function addMultipleVideos() {
		for (let i = 0; i < addAmount; i++) {
			if (withInterval) {
				await new Promise((resolve) => setTimeout(() => resolve(true), 500));
			}

			addVideo();
		}
	}

	function addVideo() {
		const val = Math.random() > 0.5 ? randInt(100, 1000) : 0;

		try {
			G.queueManager.addVideo('esouqu', message, val);
		} catch (err) {
			toast.error('Не удалось добавить видео', {
				description: (err as Error).message
			});
		}
	}

	function toggleVotingSimulation() {
		isSimulationPressed = !isSimulationPressed;
		G.__toggleVotingSimulation(isSimulationPressed);
	}
</script>

{#if dev}
	<Popover>
		<PopoverTrigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
			<ToolsIcon />
		</PopoverTrigger>
		<PopoverContent class="w-100 space-y-4 bg-muted" customAnchor={anchor} side="top" align="end">
			<div class={sectionStyles}>
				<div class="flex w-full flex-col gap-2">
					<span class="font-semibold">Сообщение</span>
					<div class="flex flex-col">
						<span class="text-sm font-semibold text-muted-foreground">Текст</span>
						<Input
							id="test-message"
							placeholder="Сообщение"
							bind:value={message}
							onenter={addMessage}
						/>
					</div>
					<div class="flex gap-2">
						<div class="flex items-center gap-2">
							<span class="text-sm font-semibold text-muted-foreground">Платное?</span>
							<Switch bind:checked={isPaid} />
						</div>
						<Button variant="ghost" class="ml-auto" onclick={addMessage}>Отправить</Button>
					</div>
				</div>
			</div>

			<div class={sectionStyles}>
				<div class="flex w-full flex-col gap-2">
					<span class="font-semibold">Видео</span>
					<div class="flex flex-col">
						<span class="text-sm font-semibold text-muted-foreground">Количество</span>
						<Input type="number" placeholder="Сумма" class="shrink-0" bind:value={addAmount} />
					</div>
					<div class="flex gap-2">
						<div class="flex items-center gap-2">
							<span class="text-sm font-semibold text-muted-foreground">Интервально?</span>
							<Switch bind:checked={withInterval} />
						</div>
						<Button variant="ghost" class="ml-auto" onclick={addMultipleVideos}>Добавить</Button>
					</div>
				</div>
			</div>
			<div class={sectionStyles}>
				<div class="flex w-full items-center justify-between">
					<span class="font-semibold"> Симуляция голосования </span>
					<Switch bind:checked={() => isSimulationPressed, toggleVotingSimulation} />
				</div>
			</div>
		</PopoverContent>
	</Popover>
{/if}
