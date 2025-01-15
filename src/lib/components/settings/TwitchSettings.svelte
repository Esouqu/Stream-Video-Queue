<script lang="ts">
	import appManager from '$lib/scripts/AppManager.svelte';
	import { page } from '$app/stores';
	import Input from '$lib/components/Input.svelte';
	import SettingWrapper from './SettingWrapper.svelte';
	import { goto } from '$app/navigation';
	import Integration from '../Integration.svelte';
	import TwitchIcon from '../icons/TwitchIcon.svelte';
	import SettingCard from './SettingCard.svelte';
	import SettingSection from './SettingSection.svelte';
	import { Switch } from '../ui/switch';

	let twitchUser = $state($page.data.twitchUserData);

	function onLogout() {
		fetch('/api/twitch/logout');
		twitchUser = undefined;
	}

	function onAuth() {
		goto('/api/twitch/auth');
	}
</script>

{#snippet icon()}
	<TwitchIcon color="#9147ff" />
{/snippet}

<SettingSection isExtended={!!twitchUser?.id}>
	{#snippet header()}
		<Integration title="Twitch" username={twitchUser?.display_name} {icon} {onAuth} {onLogout} />
	{/snippet}
	{#snippet content()}
		{#if twitchUser?.id}
			<SettingCard isExtended={appManager.poll.isEnabled}>
				{#snippet header()}
					<SettingWrapper
						title="Голосование"
						description="Возможность голосовать за продолжение или пропуск текущего видео"
						isHeader
					>
						<Switch disabled={false} bind:checked={appManager.poll.isEnabled} />
					</SettingWrapper>
				{/snippet}
				{#snippet content()}
					<SettingWrapper
						title="Оставить"
						description={`Ключевое слово за продолжение просмотра.\nИспользуйте только буквы и цифры!`}
					>
						<Input id="keep-keyword" type="text" bind:value={appManager.poll.keepKeyword} />
					</SettingWrapper>
					<SettingWrapper
						title="Пропустить"
						description={`Ключевое слово за пропуск текущего видео.\nИспользуйте только буквы и цифры!`}
					>
						<Input id="skip-keyword" type="text" bind:value={appManager.poll.skipKeyword} />
					</SettingWrapper>
					<SettingWrapper title="Количество голосов для пропуска">
						<Input
							id="twitch-votes"
							type="number"
							value={appManager.poll.neededVotes}
							confirmAction="enter/blur"
							onConfirmation={(val) => {
								if (typeof val === 'number') appManager.poll.neededVotes = val;
							}}
						/>
					</SettingWrapper>
					<SettingWrapper
						title="Автопропуск"
						description="Пропускать текущее видео по достижению нужного количества голосов"
					>
						<Switch bind:checked={appManager.poll.shouldAutoSkip} />
					</SettingWrapper>
					<SettingWrapper
						title="Повторное голосование"
						description="Дает зрителю возможность переголосовать за другой вариант"
					>
						<Switch bind:checked={appManager.poll.canChangeVote} />
					</SettingWrapper>
				{/snippet}
			</SettingCard>
		{/if}
	{/snippet}
</SettingSection>
