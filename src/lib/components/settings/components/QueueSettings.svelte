<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Switch } from '$lib/components/ui/switch';
	import appStore from '$lib/stores/AppStore.svelte';
</script>

<div class="flex flex-col gap-4">
	<Card class="relative grid auto-rows-auto grid-cols-[1fr_11rem] gap-4 p-4">
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
				bind:value={appStore.queueLimit}
			/>
		</CardContent>
	</Card>

	<Card class="relative grid auto-rows-auto grid-cols-[1fr_11rem] gap-4 p-4">
		<CardHeader class="p-0">
			<CardTitle>Удалять просмотренное</CardTitle>
			<CardDescription>
				При нажатии кнопки "следующее" или автопропуске, текущее видео будет удалено из очереди.
			</CardDescription>
		</CardHeader>
		<CardContent class="flex justify-end p-0">
			<Switch id="delete-watched" bind:checked={appStore.twitchQueue.shouldDequeue} />
		</CardContent>
	</Card>
</div>
