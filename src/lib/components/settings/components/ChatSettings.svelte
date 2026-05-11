<script lang="ts">
	import { Switch } from '$lib/components/ui/switch';
	import { Input } from '$lib/components/ui/input';
	import appStore from '$lib/stores/AppStore.svelte';
	import { createValidator } from '$lib/utils/validation.svelte';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { slide } from 'svelte/transition';

	let channel = $state('goodoq');

	const channelNameValidator = createValidator()
		.required()
		.minLength(3, 'Минимум 3 символа')
		.maxLength(25)
		.onValid((value) => (channel = value));

	const skipKeywordValidator = createValidator()
		.required()
		.minLength(2, 'Минимум 2 символа')
		.maxLength(12)
		.onValid((value) => (appStore.poll.skipKeyword = value));

	const keepKeywordValidator = createValidator()
		.required()
		.minLength(2, 'Минимум 2 символа')
		.maxLength(12)
		.onValid((value) => (appStore.poll.keepKeyword = value));

	const neededVotesValidator = createValidator()
		.required()
		.numeric()
		.onValid((value) => (appStore.poll.neededVotes = parseInt(value)));

	const currentOption = $derived.by(getCurrentOption);

	const enoughVotesActionOptions = [
		{ value: 'none', label: 'Ничего' },
		{ value: 'warning', label: 'Пропуск с предупреждением' },
		{ value: 'skip', label: 'Пропуск' }
	];

	function getCurrentOption() {
		return enoughVotesActionOptions.find((option) => option.value === appStore.enoughVotesAction);
	}
</script>

<div class="flex flex-col gap-4">
	<Card class="relative grid auto-rows-auto gap-x-4 gap-y-0 bg-blue-400/20 p-4">
		<CardHeader class="p-0">
			<CardTitle class="text-blue-300">Добавление видео</CardTitle>
			<CardDescription class="text-blue-400/80">
				Отправьте в чат команду <span class="bg-neutral-900 p-0.5 px-1 text-sm"
					>!rq {`<ссылка на видео>`}</span
				>.
				<br />
				Пример: !rq https://www.youtube.com/watch?v=dQw4w9WgXcQ
			</CardDescription>
		</CardHeader>
	</Card>

	<Card class="relative grid auto-rows-auto grid-cols-[1fr_11rem] gap-x-4 gap-y-0 p-4">
		<CardHeader class="p-0">
			<CardTitle>Twitch канал</CardTitle>
			<CardDescription>Чат канала в котором будет происходить голосование</CardDescription>
		</CardHeader>
		<CardContent class="flex p-0">
			<Input
				id="channel"
				type="text"
				placeholder="Название канала"
				error={channelNameValidator.error}
				value={channel}
				onenter={(e) => channelNameValidator.setValue(e.currentTarget.value)}
				onfocusout={(e) => channelNameValidator.setValue(e.currentTarget.value)}
			/>
		</CardContent>
	</Card>

	<Card class="gap-0 overflow-hidden">
		<CardHeader class="flex flex-row items-start justify-between">
			<div class="flex flex-col gap-0.5">
				<CardTitle>Голосование</CardTitle>
				<CardDescription>
					Возможность голосовать за продолжение или пропуск текущего видео
				</CardDescription>
			</div>
			<Switch
				id="enable-voting"
				aria-label="Enable voting"
				bind:checked={appStore.poll.isEnabled}
			/>
		</CardHeader>

		{#if appStore.poll.isEnabled}
			<div transition:slide>
				<Separator class="mt-4" />
				<CardContent class="flex flex-col gap-6 pt-6">
					<h3 class="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
						Параметры голосования
					</h3>

					<div class="grid grid-cols-2 gap-4">
						<div class="flex flex-col gap-1.5">
							<Label for="continue-keyword">Оставить</Label>
							<Input
								id="continue-keyword"
								type="text"
								placeholder="Слово"
								error={keepKeywordValidator.error}
								value={appStore.poll.keepKeyword}
								onenter={(e) => keepKeywordValidator.setValue(e.currentTarget.value)}
								onfocusout={(e) => keepKeywordValidator.setValue(e.currentTarget.value)}
							/>
							<p class="text-sm text-muted-foreground">Слово в чате, чтобы оставить видео.</p>
						</div>
						<div class="flex flex-col gap-1.5">
							<Label for="skip-keyword">Пропустить</Label>
							<Input
								id="skip-keyword"
								type="text"
								placeholder="Слово"
								error={skipKeywordValidator.error}
								value={appStore.poll.skipKeyword}
								onenter={(e) => skipKeywordValidator.setValue(e.currentTarget.value)}
								onfocusout={(e) => skipKeywordValidator.setValue(e.currentTarget.value)}
							/>
							<p class="text-sm text-muted-foreground">Слово в чате, чтобы пропустить видео.</p>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="flex flex-col gap-1.5">
							<Label for="required-votes">Сколько голосов нужно</Label>
							<Input
								id="required-votes"
								type="number"
								placeholder="Значение"
								error={neededVotesValidator.error}
								value={appStore.poll.neededVotes}
								onenter={(e) => neededVotesValidator.setValue(e.currentTarget.value)}
								onfocusout={(e) => neededVotesValidator.setValue(e.currentTarget.value)}
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<Label for="vote-action">Действие по достижению голосов</Label>
							<Select type="single" bind:value={appStore.enoughVotesAction}>
								<SelectTrigger id="vote-action" class="w-full">
									{currentOption?.label}
								</SelectTrigger>
								<SelectContent>
									{#each enoughVotesActionOptions as option (option.value)}
										<SelectItem value={option.value}>{option.label}</SelectItem>
									{/each}
								</SelectContent>
							</Select>
						</div>
					</div>

					<Separator />

					<h3 class="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
						Дополнительно
					</h3>
					<div class="flex items-center justify-between">
						<div class="flex flex-col gap-0.5">
							<Label for="allow-revoting">Повторное голосование</Label>
							<p class="text-sm text-muted-foreground">
								Возможность переголосовать за другой вариант
							</p>
						</div>
						<Switch id="allow-revoting" bind:checked={appStore.poll.canChangeVote} />
					</div>
				</CardContent>
			</div>
		{/if}
	</Card>
</div>
