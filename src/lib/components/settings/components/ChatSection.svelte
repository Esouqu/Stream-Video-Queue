<script lang="ts">
	import { Switch } from '$lib/components/ui/switch';
	import { Input } from '$lib/components/ui/input';
	import G from '$lib/stores/G.svelte';
	import FieldValidator from '$lib/stores/FieldValidator.svelte';
	import Setting from './Setting.svelte';
	import SettingGroup from './SettingGroup.svelte';

	const skipKeywordValidator = new FieldValidator()
		.required()
		.minLength(2, 'Минимум 2 символа')
		.maxLength(12)
		.onValid((value) => (G.settings.skipKeyword = value));

	const keepKeywordValidator = new FieldValidator()
		.required()
		.minLength(2, 'Минимум 2 символа')
		.maxLength(12)
		.onValid((value) => (G.settings.keepKeyword = value));

	const neededVotesValidator = new FieldValidator()
		.required()
		.numeric()
		.onValid((value) => (G.settings.neededVotes = parseInt(value)));
</script>

<div class="flex flex-col gap-4">
	<Setting>
		{#snippet title()}
			Заказ видео (чат)
		{/snippet}
		{#snippet description()}
			В чате:
			<span class="rounded bg-blue-900 px-1 font-semibold text-blue-300">
				!rq &lt;ссылка на видео&gt;
			</span>. Видео будут добавляться в конец очереди исключая повторений.
		{/snippet}
	</Setting>

	<Setting>
		{#snippet title()}
			Макс. заказов на пользователя
		{/snippet}
		{#snippet description()}
			Ограничить максимальное количество заказов, которое может сделать один пользователь.
			<br />
			<i>Оставьте поле пустым, чтобы не ограничивать.</i>
		{/snippet}
		{#snippet input()}
			<Input
				id="max-requests-per-user"
				type="number"
				placeholder="Неограничено"
				bind:value={G.settings.maxRequestsPerUser}
			/>
		{/snippet}
	</Setting>

	<Setting isEnabled={G.settings.isPollEnabled}>
		{#snippet title()}
			Голосование
		{/snippet}
		{#snippet description()}
			Возможность голосовать за продолжение или пропуск текущего видео.
		{/snippet}
		{#snippet input()}
			<Switch id="enable-voting" bind:checked={G.settings.isPollEnabled} />
		{/snippet}
		{#snippet content()}
			<SettingGroup title="Основные параметры">
				<Setting isSub>
					{#snippet title()}
						Оставить
					{/snippet}
					{#snippet description()}
						Слово в чате, чтобы оставить видео.
					{/snippet}
					{#snippet input()}
						<Input
							id="continue-keyword"
							type="text"
							placeholder="Слово"
							error={keepKeywordValidator.error}
							value={G.settings.keepKeyword}
							onenter={(e) => keepKeywordValidator.setValue(e.currentTarget.value)}
							onfocusout={(e) => keepKeywordValidator.setValue(e.currentTarget.value)}
						/>
					{/snippet}
				</Setting>

				<Setting isSub>
					{#snippet title()}
						Пропустить
					{/snippet}
					{#snippet description()}
						Слово в чате, чтобы пропустить видео.
					{/snippet}
					{#snippet input()}
						<Input
							id="skip-keyword"
							type="text"
							placeholder="Слово"
							error={skipKeywordValidator.error}
							value={G.settings.skipKeyword}
							onenter={(e) => skipKeywordValidator.setValue(e.currentTarget.value)}
							onfocusout={(e) => skipKeywordValidator.setValue(e.currentTarget.value)}
						/>
					{/snippet}
				</Setting>

				<Setting isSub>
					{#snippet title()}
						Сколько голосов нужно
					{/snippet}
					{#snippet input()}
						<Input
							id="required-votes"
							type="number"
							placeholder="Значение"
							error={neededVotesValidator.error}
							value={G.settings.neededVotes}
							onenter={(e) => neededVotesValidator.setValue(e.currentTarget.value)}
							onfocusout={(e) => neededVotesValidator.setValue(e.currentTarget.value)}
						/>
					{/snippet}
				</Setting>
			</SettingGroup>

			<SettingGroup title="Дополнительно">
				<Setting isSub>
					{#snippet title()}
						Повторное голосование
					{/snippet}
					{#snippet description()}
						Возможность переголосовать за другой вариант.
					{/snippet}
					{#snippet input()}
						<Switch id="allow-revoting" bind:checked={G.settings.canChangeVote} />
					{/snippet}
				</Setting>

				<Setting isSub>
					{#snippet title()}
						Задержка перед голосованием
					{/snippet}
					{#snippet description()}
						Сколько секунд будет недоступно голосование.
						<br />
						<i>Оставьте поле пустым, чтобы не было задержки.</i>
					{/snippet}
					{#snippet input()}
						<Input
							id="seconds-before-start"
							type="number"
							class="w-48"
							placeholder="Без задержки"
							suffix="сек."
							bind:value={G.settings.secondsBeforeStart}
						/>
					{/snippet}
				</Setting>
			</SettingGroup>
		{/snippet}
	</Setting>
</div>
