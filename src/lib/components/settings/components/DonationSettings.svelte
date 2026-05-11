<script lang="ts">
	import DonatePayIntegration from '$lib/components/DonatePayAuth.svelte';
	import DonationAlertsIntegration from '$lib/components/DonationAlertsAuth.svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import { Switch } from '$lib/components/ui/switch';
</script>

<div class="flex flex-col gap-4">
	<Card class="relative grid auto-rows-auto gap-x-4 gap-y-0 bg-blue-400/20 p-4">
		<CardHeader class="p-0">
			<CardTitle class="text-blue-300">Добавление видео</CardTitle>
			<CardDescription class="text-blue-400/80">
				Отправьте донат с ссылкой на видео.
				<br />
				Пример: Привет! https://www.youtube.com/watch?v=dQw4w9WgXcQ посмотри это видео
			</CardDescription>
		</CardHeader>
	</Card>
	<div class="flex gap-4">
		<DonationAlertsIntegration />
		<DonatePayIntegration />
	</div>
	<Card class="relative grid auto-rows-auto grid-cols-[1fr_11rem] gap-x-4 gap-y-0 p-4">
		<CardHeader class="p-0">
			<CardTitle>Минимальная стоимость</CardTitle>
		</CardHeader>
		<CardContent class="flex justify-end p-0">
			<Input id="donation-request-price" type="number" placeholder="Значение" />
		</CardContent>
	</Card>
	<Card class="relative grid auto-rows-auto grid-cols-[1fr_6rem] gap-x-4 gap-y-0 p-4">
		<CardHeader class="p-0">
			<CardTitle>Таймер</CardTitle>
			<CardDescription>Ограничить время воспроизведения видео</CardDescription>
		</CardHeader>
		<CardContent class="flex justify-end p-0">
			<Switch id="timer-enable" />
		</CardContent>
		<!-- {#if appStore.poll.isEnabled} -->
		<CardFooter class="col-span-2 flex flex-col gap-4 border-t px-0">
			<Card
				class="relative grid w-full auto-rows-auto grid-cols-[1fr_11rem] gap-4 border-none bg-transparent p-0 shadow-none"
			>
				<CardHeader class="items-center p-0">
					<CardTitle>Стоимость за секунду</CardTitle>
				</CardHeader>
				<CardContent class="flex p-0">
					<Input id="timer-value" type="number" placeholder="Значение" />
				</CardContent>
			</Card>
			<Card
				class="relative grid w-full auto-rows-auto grid-cols-[1fr_11rem] gap-4 border-none bg-transparent p-0 shadow-none"
			>
				<CardHeader class="items-center p-0">
					<CardTitle>По окончанию таймера</CardTitle>
				</CardHeader>
				<CardContent class="flex p-0">
					<Select type="single">
						<SelectTrigger>Выберите действие</SelectTrigger>
						<SelectContent>
							{#each ['Ничего', 'Пауза', 'Следующее видео'] as value}
								<SelectItem {value}>{value}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</CardContent>
			</Card>
		</CardFooter>
		<!-- {/if} -->
	</Card>
</div>
