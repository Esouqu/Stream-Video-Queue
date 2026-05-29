<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Switch } from '$lib/components/ui/switch';
	import G from '$lib/stores/G.svelte';
	import Setting from './Setting.svelte';

	function setPaidTimerChecked(checked: boolean) {
		G.settings.isPaidTimeEnabled = checked;
	}
</script>

<div class="space-y-4">
	<Setting>
		{#snippet title()}
			Заказ видео (донат)
		{/snippet}
		{#snippet description()}
			В донате:
			<span class="rounded bg-blue-900 px-1 font-semibold text-blue-300">
				&lt;ссылка на видео&gt;
			</span>. Видео из доната будут формировать отдельную очередь после текущего видео.
		{/snippet}
		{#snippet content()}
			<Setting isSub>
				{#snippet title()}
					Минимальная стоимость
				{/snippet}
				{#snippet input()}
					<Input
						id="donation-request-price"
						type="number"
						placeholder="Значение"
						suffix="₽"
						bind:value={G.settings.paidVideoPrice}
					/>
				{/snippet}
			</Setting>
		{/snippet}
	</Setting>

	<Setting isEnabled={G.settings.isPaidTimeEnabled}>
		{#snippet title()}
			Ограничение по времени
		{/snippet}
		{#snippet description()}
			Ограничить время воспроизведения видео. Когда оплаченое время закончится, текущее видео будет
			автоматически пропущено.
		{/snippet}
		{#snippet input()}
			<Switch
				id="timer-enable"
				bind:checked={() => G.settings.isPaidTimeEnabled, setPaidTimerChecked}
			/>
		{/snippet}
		{#snippet content()}
			<Setting isSub>
				{#snippet title()}
					Стоимость за минуту
				{/snippet}
				{#snippet input()}
					<Input
						id="timer-value"
						type="number"
						placeholder="Значение"
						suffix="₽/мин"
						bind:value={G.settings.paidTimePricePerMinute}
					/>
				{/snippet}
			</Setting>
		{/snippet}
	</Setting>
</div>
