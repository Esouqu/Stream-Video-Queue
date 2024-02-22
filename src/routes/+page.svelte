<script lang="ts">
	import queue from '$lib/stores/queue';
	import Tabs from '$lib/components/Tabs.svelte';
	import SwitchSetting from '$lib/components/SwitchSetting.svelte';
	import VideoPlayer from '$lib/components/VideoPlayer.svelte';
	import chat from '$lib/chat';
	import { CHAT_STATE } from '$lib/constants';
	import Queue from '$lib/components/Queue.svelte';
	import settings from '$lib/stores/settings';
	import Indicator from '$lib/components/Indicator.svelte';
	import votes from '$lib/stores/votes';
	import { fly, slide } from 'svelte/transition';
	import Button from '$lib/components/Button.svelte';
	import { goto } from '$app/navigation';
	import twitchIcon from '$lib/assets/twitch-logo/TwitchGlitchWhite.svg';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import initializeSubscriptions from '$lib/subscriptionBus';
	import NumberInput from '$lib/components/NumberInput.svelte';
	import Contact from '$lib/components/Contact.svelte';
	import githubIcon from '$lib/assets/github-mark/github-mark-white.svg';
	import discordIcon from '$lib/assets/discord-logo/icon_clyde_white_RGB.svg';

	let twitchChannel = $page.data.twitchChannel;
	let currentTab: number;

	$: isAutoskip = settings.isAutoskip;
	$: isAutoplay = settings.isAutoplay;
	$: isAutodetection = settings.isAutodetection;
	$: percentFromViewCount = settings.percentFromViewCount;
	$: isAddRandomly = settings.isAddRandomly;
	$: userInput = settings.userInput;
	$: votesDifference = votes.difference;
	$: chatState = chat.state;
	$: {
		if ($isAutoskip && $votesDifference >= $userInput.needed) queue.setNext();
	}
	$: tabs = [`Очередь (${$queue.length})`, 'Настройки'];

	onMount(() => initializeSubscriptions());

	async function connectToChat() {
		if ($chatState === CHAT_STATE.NOT_EXISTS && twitchChannel) {
			chat.initialize(twitchChannel.login);
		} else if ($chatState === CHAT_STATE.DISCONNECTED) {
			chat.connect();
		}

		// await fetch(`api/twitch/polls?broadcaster_id=${twitchChannel}`, { method: 'POST' })
		// 	.then((res) => res.json())
		// 	.then((data: ITwitchPollData) => console.log(data));
	}
</script>

<svelte:head>
	<title>Stream Video Queue</title>
</svelte:head>

<div class="main-page">
	<VideoPlayer />
	<div class="left-side">
		<Tabs options={tabs} bind:currentTab />
		<div class="transition-container">
			{#if currentTab === 0}
				<div
					style="display: flex; flex-direction: column; height: 100%; overflow: hidden;"
					transition:fly={{ x: -200, duration: 300 }}
				>
					{#if $chatState === CHAT_STATE.CONNECTED}
						<div class="chat-connection" transition:slide={{ axis: 'y', duration: 300 }}>
							<span>Чат подключен</span>
							<Indicator isActive={$chatState === CHAT_STATE.CONNECTED} />
						</div>
					{/if}
					<Queue />
					<!-- <div class="chat-connection"></div> -->
				</div>
			{:else if currentTab === 1}
				<div class="settings-wrapper" transition:fly={{ x: 200, duration: 300 }}>
					<div>
						<h3>Twitch</h3>
						{#if !twitchChannel}
							<div style="display: flex; flex: 1; justify-content: space-between; padding: 0 10px;">
								<div style="display: flex; align-items: center; gap: 10px;">
									<div style="display: flex; align-items: center; width: 25px;">
										<img src={twitchIcon} alt="Twitch Brand Icon" />
									</div>
									<h4 style="margin: 0;">Twitch</h4>
								</div>
								<Button on:click={() => goto('/api/twitch/auth')} title="Авторизоваться" />
							</div>
						{:else}
							<SwitchSetting
								icon={twitchChannel?.profile_image_url}
								title={twitchChannel?.display_name}
								description="Следить за чатом канала в поисках ключевых слов и ссылок на Youtube"
								on={connectToChat}
								off={chat.disconnet}
								isToggled={$chatState === CHAT_STATE.CONNECTED}
								isDisabled={$chatState === CHAT_STATE.CONNECTING}
								isLoading={$chatState === CHAT_STATE.CONNECTING}
							/>
						{/if}
					</div>
					<div>
						<h3>Плеер</h3>
						<SwitchSetting
							title="Автовоспроизведение"
							description="Автоматически воспроизводить видео"
							on={() => isAutoplay.set(true)}
							off={() => isAutoplay.set(false)}
							isToggled={$isAutoplay}
						/>
					</div>
					<div>
						<h3>Голоса</h3>
						<div style="display: flex; flex-direction: column; gap: 10px">
							<SwitchSetting
								title="Автопропуск"
								description="Автоматически пропускать видео, если набранно достаточное количество голосов"
								on={() => isAutoskip.set(true)}
								off={() => isAutoskip.set(false)}
								isToggled={$isAutoskip}
							/>
							<SwitchSetting
								title="Автоопределение"
								description="Автоматически определять нужное количество голосов в зависимости от указанного значения, не чаще, чем раз в 2 минуты"
								on={() => isAutodetection.set(true)}
								off={() => isAutodetection.set(false)}
								isToggled={$isAutodetection}
							/>
							<div class="additional-autodetect-setting" class:disabled={!$isAutodetection}>
								<span>Процент от количества зрителей</span>
								<NumberInput
									--input-p="10.5px"
									--input-w-w="90px"
									--input-w="100%"
									--input-text-al="start"
									id="autodetection-percent"
									suffix="%"
									isFilled={false}
									isBorderless={false}
									isDisabled={!$isAutodetection}
									bind:value={$percentFromViewCount}
								/>
							</div>
						</div>
					</div>
					<div>
						<h3>Очередь</h3>
						<div style="display: flex; flex-direction: column; gap: 10px">
							<SwitchSetting
								title="Добавлять Случайно"
								description="Добавлять новое видео в случайном порядке"
								on={() => isAddRandomly.set(true)}
								off={() => isAddRandomly.set(false)}
								isToggled={$isAddRandomly}
							/>
							<div>
								<Button
									--button-bg="var(--surface-variant)"
									title="Очистить очередь"
									on:click={() => queue.removeAll()}
								/>
							</div>
						</div>
					</div>

					<div class="contacts-wrapper">
						<Contact icon={githubIcon} title="Esouqu" url="https://github.com/Esouqu" />
						<Contact icon={discordIcon} title="nikogda" />
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	.main-page {
		display: grid;
		grid-template-columns: auto 420px;
		width: 100%;
	}

	.left-side {
		position: relative;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.settings-wrapper {
		display: flex;
		flex-direction: column;
		padding: 10px;
		color: var(--on-surface);
	}

	.chat-connection {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 15px 0;
		color: var(--on-surface-variant);
	}

	.additional-autodetect-setting {
		display: flex;
		flex: 1;
		justify-content: space-between;
		align-items: center;
		padding: 0 10px;
		font-size: 14px;
		font-weight: 300;

		&.disabled span {
			opacity: 0.5;
		}
	}

	.contacts-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 20px;
		position: absolute;
		bottom: 28px;
		width: 100%;
	}

	.transition-container {
		display: grid;
		grid-template-rows: 1fr;
		grid-template-columns: 1fr;
		height: 100%;
		width: 100%;
		overflow: hidden;

		& > * {
			grid-row: 1;
			grid-column: 1;
		}
	}
</style>
