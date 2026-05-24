<script lang="ts">
	import ClearQueueButton from '$lib/components/ClearQueueButton.svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import G from '$lib/stores/G.svelte';

	const enoughVotesActionOptions = [
		{ value: 'none', label: 'Выкл.' },
		{ value: 'warning', label: 'С таймером' },
		{ value: 'skip', label: 'Мгновенно' }
	];

	const currentOption = $derived.by(getCurrentOption);

	function getCurrentOption() {
		return enoughVotesActionOptions.find((option) => option.value === G.autoSkipAction);
	}
</script>

<div class="flex flex-col gap-4">
	<Card class="relative grid auto-rows-auto grid-cols-[1fr_12rem] gap-4 p-4">
		<CardHeader class="p-0">
			<CardTitle>Автоскип</CardTitle>
			<CardDescription
				>Автоматически пропускать видео при наборе голосов или истечении оплаченного времени.</CardDescription
			>
		</CardHeader>
		<CardContent class="flex justify-end p-0">
			<Select type="single" bind:value={G.autoSkipAction}>
				<SelectTrigger id="enough-votes-action" class="w-full">
					{currentOption?.label}
				</SelectTrigger>
				<SelectContent>
					{#each enoughVotesActionOptions as option (option.value)}
						<SelectItem value={option.value}>{option.label}</SelectItem>
					{/each}
				</SelectContent>
			</Select>
		</CardContent>
	</Card>

	<Card class="relative grid auto-rows-auto grid-cols-[1fr_12rem] gap-4 p-4">
		<CardHeader class="p-0">
			<CardTitle>Ограничение очереди</CardTitle>
			<CardDescription>
				Ограничить максимальное количество видео в очереди. После заполнения, новые видео не будут
				приниматься.
				<br />
				<i>Оставьте поле пустым, чтобы не ограничивать.</i>
			</CardDescription>
		</CardHeader>
		<CardContent class="flex justify-end p-0">
			<Input
				id="queue-limit"
				type="number"
				placeholder="Неограниченно"
				bind:value={G.queueManager.limit}
			/>
		</CardContent>
	</Card>

	<Card class="relative grid auto-rows-auto grid-cols-[1fr_12rem] gap-4 p-4">
		<CardHeader class="p-0">
			<CardTitle>Очистить очередь</CardTitle>
			<CardDescription>Все видео в очереди будут навсегда удалены.</CardDescription>
		</CardHeader>
		<CardContent class="flex justify-end p-0">
			<ClearQueueButton />
		</CardContent>
	</Card>
</div>
