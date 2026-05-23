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
	<Card class="gap-0 overflow-hidden">
		<CardHeader class="flex flex-row items-start justify-between gap-4">
			<div class="flex flex-col gap-0.5">
				<CardTitle>Приоритетный заказ</CardTitle>
				<CardDescription>
					В донате: <span class="rounded bg-blue-900 px-1 font-semibold text-blue-300">
						&lt;ссылка на видео&gt;
					</span>.
					<br />
					Видео будут добавляться сразу после текущего.
				</CardDescription>
			</div>
			<Switch id="timer-enable" bind:checked={appStore.paidTimerEnabled} />
		</CardHeader>

		{#if appStore.paidTimerEnabled}
			<div transition:slide>
				<Separator class="mt-4" />
				<CardContent class="flex flex-col gap-6 pt-6">
					<div class="grid grid-cols-[1fr_12rem]">
						<div class="flex flex-col justify-center gap-0.5">
							<Label for="donation-request-price">Минимальная стоимость</Label>
						</div>
						<Input
							id="donation-request-price"
							type="number"
							placeholder="Значение"
							suffix="₽"
							bind:value={appStore.prioritizedVideoPrice}
						/>
					</div>
				</CardContent>
			</div>
		{/if}
	</Card>

	<Card class="gap-0 overflow-hidden">
		<CardHeader class="flex flex-row items-start justify-between gap-4">
			<div class="flex flex-col gap-0.5">
				<CardTitle>Таймер</CardTitle>
				<CardDescription
					>Ограничить время воспроизведения видео. Когда оплаченое время закончится, текущее видео
					будет автоматически пропущено.</CardDescription
				>
			</div>
			<Switch id="timer-enable" bind:checked={appStore.paidTimerEnabled} />
		</CardHeader>

		{#if appStore.paidTimerEnabled}
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
							bind:value={appStore.paidTimerPricePerMinute}
						/>
					</div>
				</CardContent>
			</div>
		{/if}
	</Card>
</div>
