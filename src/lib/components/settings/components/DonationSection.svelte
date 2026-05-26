<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Switch } from '$lib/components/ui/switch';
	import G from '$lib/stores/G.svelte';
	import Setting from './Setting.svelte';

	let isEnabledTEST = $state(false);

	function setPaidTimerChecked(checked: boolean) {
		G.settings.isPaidTimerEnabled = checked;
		G.paidTimer.reset();
	}
</script>

<div class="space-y-4">
	<Setting isEnabled={isEnabledTEST}>
		{#snippet title()}
			Приоритетный заказ
		{/snippet}
		{#snippet description()}
			В донате: <span class="rounded bg-blue-900 px-1 font-semibold text-blue-300">
				&lt;ссылка на видео&gt;
			</span>.
			<br />
			Видео будут добавляться сразу после текущего.
		{/snippet}
		{#snippet input()}
			<Switch bind:checked={isEnabledTEST} />
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
						bind:value={G.settings.prioritizedVideoPrice}
					/>
				{/snippet}
			</Setting>
		{/snippet}
	</Setting>

	<Setting isEnabled={G.settings.isPaidTimerEnabled}>
		{#snippet title()}
			Таймер
		{/snippet}
		{#snippet description()}
			Ограничить время воспроизведения видео. Когда оплаченое время закончится, текущее видео будет
			автоматически пропущено.
		{/snippet}
		{#snippet input()}
			<Switch
				id="timer-enable"
				bind:checked={() => G.settings.isPaidTimerEnabled, setPaidTimerChecked}
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
						bind:value={G.settings.paidTimerPricePerMinute}
					/>
				{/snippet}
			</Setting>
		{/snippet}
	</Setting>
</div>
