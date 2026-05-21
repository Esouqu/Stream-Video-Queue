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

	const pollTypeOptions = [
		{ value: 'first', label: 'Первенство' },
		{ value: 'difference', label: 'Разница' }
	];
	// const currentPollTypeOption = $derived.by(getCurrentPollTypeOption)
	// function getCurrentOption() {
	// 	return enoughVotesActionOptions.find((option) => option.value === appStore.enoughVotesAction);
	// }
</script>

<div class="flex flex-col gap-4">
	<Card class="gap-0 overflow-hidden">
		<CardHeader class="flex flex-row items-start justify-between">
			<div class="flex flex-col gap-0.5">
				<CardTitle>Голосование</CardTitle>
				<CardDescription>
					Возможность голосовать за продолжение или пропуск текущего видео.
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
						Основные параметры
					</h3>

					<div class="grid grid-cols-[1fr_12rem] gap-4">
						<div class="flex flex-col gap-0.5">
							<Label for="poll-type">Тип голосования</Label>
							<p class="text-sm text-muted-foreground">
								Первенство — первый вариант, который наберет нужное количество голосов, завершит
								голосование.
								<br />
								Разница — голосование не закончится, пока не будет указанной разницы голосов в пользу
								пропуска.
							</p>
						</div>

						<Select type="single">
							<SelectTrigger id="poll-type" class="w-full">Первенство</SelectTrigger>
							<SelectContent>
								{#each pollTypeOptions as option (option.value)}
									<SelectItem value={option.value}>{option.label}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</div>

					<div class="grid grid-cols-[1fr_12rem] gap-4">
						<div class="flex flex-col gap-0.5">
							<Label for="continue-keyword">Оставить</Label>
							<p class="text-sm text-muted-foreground">Слово в чате, чтобы оставить видео.</p>
						</div>

						<Input
							id="continue-keyword"
							type="text"
							placeholder="Слово"
							error={keepKeywordValidator.error}
							value={appStore.poll.keepKeyword}
							onenter={(e) => keepKeywordValidator.setValue(e.currentTarget.value)}
							onfocusout={(e) => keepKeywordValidator.setValue(e.currentTarget.value)}
						/>
					</div>
					<div class="grid grid-cols-[1fr_12rem] gap-4">
						<div class="flex flex-col gap-0.5">
							<Label for="skip-keyword">Пропустить</Label>
							<p class="text-sm text-muted-foreground">Слово в чате, чтобы пропустить видео.</p>
						</div>

						<Input
							id="skip-keyword"
							type="text"
							placeholder="Слово"
							error={skipKeywordValidator.error}
							value={appStore.poll.skipKeyword}
							onenter={(e) => skipKeywordValidator.setValue(e.currentTarget.value)}
							onfocusout={(e) => skipKeywordValidator.setValue(e.currentTarget.value)}
						/>
					</div>

					<div class="grid grid-cols-[1fr_12rem] gap-4">
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

					<Separator />

					<h3 class="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
						Дополнительно
					</h3>

					<div class="grid grid-cols-[1fr_12rem] items-center gap-4">
						<div class="flex flex-col gap-0.5">
							<Label for="allow-revoting">Повторное голосование</Label>
							<p class="text-sm text-muted-foreground">
								Возможность переголосовать за другой вариант.
							</p>
						</div>
						<Switch id="allow-revoting" bind:checked={appStore.poll.canChangeVote} />
					</div>

					<div class="grid grid-cols-[1fr_12rem] gap-4">
						<div class="flex flex-col gap-0.5">
							<Label for="seconds-before-start">Задержка перед голосованием</Label>
							<p class="text-sm text-muted-foreground">
								Сколько секунд будет недоступно голосование.
								<br />
								<i>Оставьте поле пустым, чтобы не было задержки.</i>
							</p>
						</div>
						<Input
							id="seconds-before-start"
							type="number"
							class="w-48"
							placeholder="Без задержки"
							suffix="сек."
							bind:value={appStore.poll.secondsBeforeStart}
						/>
					</div>
				</CardContent>
			</div>
		{/if}
	</Card>
</div>
