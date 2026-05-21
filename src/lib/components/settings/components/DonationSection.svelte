<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Switch } from '$lib/components/ui/switch';
	import appStore from '$lib/stores/AppStore.svelte';
	import { slide } from 'svelte/transition';
</script>

<div class="flex flex-col gap-4">
	<Card class="relative grid auto-rows-auto grid-cols-[1fr_12rem] gap-x-4 gap-y-0 p-4">
		<CardHeader class="p-0">
			<CardTitle>Приоритетный заказ</CardTitle>
			<CardDescription>
				Минимальная стоимость приоритетного заказа. Видео будут добавляться сразу после текущего.
			</CardDescription>
		</CardHeader>
		<Input
			id="donation-request-price"
			type="number"
			placeholder="Значение"
			suffix="₽"
			bind:value={appStore.prioritizedVideoPrice}
		/>
	</Card>

	<Card class="gap-0 overflow-hidden">
		<CardHeader class="flex flex-row items-start justify-between">
			<div class="flex flex-col gap-0.5">
				<CardTitle>Таймер</CardTitle>
				<CardDescription
					>Ограничить время воспроизведения видео. Когда оплаченое время закончится, текущее видео
					будет автоматически пропущено.</CardDescription
				>
			</div>
			<Switch id="timer-enable" bind:checked={appStore.payedTimerEnabled} />
		</CardHeader>

		{#if appStore.payedTimerEnabled}
			<div transition:slide>
				<Separator class="mt-4" />
				<CardContent class="flex flex-col gap-6 pt-6">
					<div class="grid grid-cols-[1fr_12rem]">
						<div class="flex flex-col justify-center gap-0.5">
							<Label for="timer-value">Стоимость за минуту</Label>
						</div>
						<Input
							id="timer-value"
							type="number"
							placeholder="Значение"
							suffix="₽/мин"
							bind:value={appStore.payedTimerPricePerMinute}
						/>
					</div>
				</CardContent>
			</div>
		{/if}
	</Card>
</div>
