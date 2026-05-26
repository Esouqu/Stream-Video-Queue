<script lang="ts">
	import ClearQueueButton from '$lib/components/ClearQueueButton.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import G from '$lib/stores/G.svelte';
	import Setting from './Setting.svelte';

	const enoughVotesActionOptions = [
		{ value: 'none', label: 'Выкл.' },
		{ value: 'warning', label: 'С таймером' },
		{ value: 'skip', label: 'Мгновенно' }
	];

	const currentOption = $derived.by(getCurrentOption);

	function getCurrentOption() {
		return enoughVotesActionOptions.find((option) => option.value === G.settings.autoSkipAction);
	}
</script>

<div class="flex flex-col gap-4">
	<Setting>
		{#snippet title()}
			Автоскип
		{/snippet}
		{#snippet description()}
			Автоматически пропускать видео при наборе голосов или истечении оплаченного времени.
		{/snippet}
		{#snippet input()}
			<Select type="single" bind:value={G.settings.autoSkipAction}>
				<SelectTrigger id="enough-votes-action" class="w-full">
					{currentOption?.label}
				</SelectTrigger>
				<SelectContent>
					{#each enoughVotesActionOptions as option (option.value)}
						<SelectItem value={option.value}>{option.label}</SelectItem>
					{/each}
				</SelectContent>
			</Select>
		{/snippet}
	</Setting>

	<Setting>
		{#snippet title()}
			Ограничение очереди
		{/snippet}
		{#snippet description()}
			Ограничить максимальное количество видео в очереди. После заполнения, новые видео не будут
			приниматься.
			<br />
			<i>Оставьте поле пустым, чтобы не ограничивать.</i>
		{/snippet}
		{#snippet input()}
			<Input
				id="queue-limit"
				type="number"
				placeholder="Неограниченно"
				bind:value={G.settings.queueLimit}
			/>
		{/snippet}
	</Setting>

	<Setting>
		{#snippet title()}
			Очистить очередь
		{/snippet}
		{#snippet description()}
			Все видео в очереди будут навсегда удалены.
		{/snippet}
		{#snippet input()}
			<ClearQueueButton />
		{/snippet}
	</Setting>
</div>
