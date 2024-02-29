<script lang="ts">
	import queue from '$lib/stores/queue';
	import Tabs from '$lib/components/Tabs.svelte';
	import SwitchSetting from '$lib/components/SwitchSetting.svelte';
	import VideoPlayer from '$lib/components/VideoPlayer.svelte';
	import chat from '$lib/chat';
	import { CHAT_STATE, SOCKET_STATE } from '$lib/constants';
	import Queue from '$lib/components/Queue.svelte';
	import settings from '$lib/stores/settings';
	import Indicator from '$lib/components/Indicator.svelte';
	import votes from '$lib/stores/votes';
	import { fly } from 'svelte/transition';
	import Button from '$lib/components/Button.svelte';
	import twitchIcon from '$lib/assets/twitch-logo/TwitchGlitchWhite.svg';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import initializeSubscriptions from '$lib/subscriptionBus';
	import NumberInput from '$lib/components/NumberInput.svelte';
	import Contact from '$lib/components/Contact.svelte';
	import githubIcon from '$lib/assets/github-mark/github-mark-white.svg';
	import discordIcon from '$lib/assets/discord-logo/icon_clyde_white_RGB.svg';
	import centrifugo from '$lib/centrifugo';
	import donationAlertsIcon from '$lib/assets/donationalerts-logo/DA_Alert_White.svg';
	import Auth from '$lib/components/Auth.svelte';
	import SettingSection from '$lib/components/SettingSection.svelte';

	let twitchChannel = $page.data.twitchChannel;
	let donationAlertsUser = $page.data.donationAlertsUser;
	let currentTab: number;
	let scrollElement: HTMLDivElement;

	$: isAutoskip = settings.isAutoskip;
	$: isAutoplay = settings.isAutoplay;
	$: isAutodetection = settings.isAutodetection;
	$: percentFromViewCount = settings.percentFromViewCount;
	$: minDonationValue = settings.minDonationValue;
	$: isAddRandomly = settings.isAddRandomly;
	$: userInput = settings.userInput;
	$: votesDifference = votes.difference;
	$: chatState = chat.state;
	$: centrifugoState = centrifugo.state;
	$: {
		if ($isAutoskip && $votesDifference >= $userInput.needed) queue.setNext();
	}
	$: tabs = [`Очередь (${$queue.length})`, 'Настройки'];

	onMount(() => {
		initializeSubscriptions();

		if (!twitchChannel) return;

		const validationInterval = 1000 * 60 * 60;

		setInterval(async () => {
			const response = await fetch('/api/twitch/validate').then((res) => res);

			if (response.status === 401 || response.status === 400) {
				const refreshResponse = await fetch('/api/twitch/refresh', {
					method: 'POST'
				}).then((res) => res);

				if (refreshResponse.status !== 200) location.reload();
			}
		}, validationInterval);
	});

	async function connectToCertifugo() {
		if ($centrifugoState === SOCKET_STATE.CLOSED && donationAlertsUser) {
			await centrifugo.connect(donationAlertsUser);
		}
	}

	function connectToChat() {
		if ($chatState === CHAT_STATE.NOT_EXISTS && twitchChannel) {
			chat.initialize(twitchChannel.login);
		} else if ($chatState === CHAT_STATE.DISCONNECTED) {
			chat.connect();
		}
	}
</script>

<svelte:head>
	<title>Stream Video Queue</title>
</svelte:head>

<div class="main-page">
	<VideoPlayer
		on:next={() => {
			scrollElement.scrollTo({
				top: 0,
				behavior: 'instant'
			});
		}}
	/>
	<div class="left-side">
		<Tabs options={tabs} bind:currentTab />
		<div class="transition-container">
			{#if currentTab === 0}
				<div
					style="display: flex; flex-direction: column; height: 100%; overflow: hidden;"
					transition:fly={{ x: -200, duration: 300 }}
				>
					<!-- <div>
						<Button title="Donate" on:click={() => queue.add('ovU-lOSLHmk', 'Anon', true)} />
						<Button
							title="Donate Multiple"
							on:click={() => {
								let count = 1;
								const intervalId = setInterval(() => {
									count++;
									if (count > 5) clearInterval(intervalId);

									queue.add('ovU-lOSLHmk', 'Anon', true);
								}, 100);
							}}
						/>
					</div> -->
					<Queue bind:scrollElement />
					<div class="connections">
						<div
							style="display: flex;
							align-items: center;
							gap: 10px;"
						>
							<div style="display: flex; align-items: center; width: 25px;">
								<img src={twitchIcon} alt="Twitch Brand Icon" />
							</div>
							<!-- <span>Чат {$chatState === CHAT_STATE.CONNECTED ? 'подключен' : 'отключен'}</span> -->
							<Indicator isActive={$chatState === CHAT_STATE.CONNECTED} />
						</div>
						<div
							style="display: flex;
							align-items: center;
							gap: 10px;"
						>
							<div style="display: flex; align-items: center; width: 25px;">
								<img src={donationAlertsIcon} alt="Twitch Brand Icon" />
							</div>
							<!-- <span
								>Донаты {$centrifugoState === SOCKET_STATE.OPEN ? 'подключены' : 'отключены'}</span
							> -->
							<Indicator isActive={$centrifugoState === SOCKET_STATE.OPEN} />
						</div>
						<!-- <Button --button-bg="var(--surface-variant)" title="Очистить очередь" /> -->
					</div>
				</div>
			{:else if currentTab === 1}
				<div class="settings-wrapper" transition:fly={{ x: 200, duration: 300 }}>
					<div>
						{#if !twitchChannel}
							<Auth icon={twitchIcon} title="Twitch" url="/api/twitch/auth" />
						{:else}
							<div style="display: flex; align-items: center; gap: 15px;">
								<div style="display: flex; align-items: center; width: 25px;">
									<img src={twitchIcon} alt="Twitch Brand Icon" />
								</div>
								<h3>Twitch</h3>
							</div>
							<SwitchSetting
								icon={twitchChannel.profile_image_url}
								title={twitchChannel.display_name}
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
						{#if !donationAlertsUser}
							<Auth
								icon={donationAlertsIcon}
								title="DonationAlerts"
								url="/api/donationalerts/auth"
							/>
						{:else}
							<div style="display: flex; align-items: center; gap: 15px;">
								<div style="display: flex; align-items: center; width: 25px;">
									<img src={donationAlertsIcon} alt="DonationAlerts Brand Icon" />
								</div>
								<h3>DonationAlerts</h3>
							</div>
							<div style="display: flex; flex-direction: column; gap: 10px">
								<SwitchSetting
									icon={donationAlertsUser.avatar}
									title={donationAlertsUser.name}
									description={`Следить за донатами в поисках ссылок на Youtube.\nЗаказанные этим путем видео будут находиться выше остальных`}
									on={connectToCertifugo}
									off={centrifugo.disconnect}
									isToggled={$centrifugoState === SOCKET_STATE.OPEN}
									isDisabled={$centrifugoState === SOCKET_STATE.CONNECTING}
									isLoading={$centrifugoState === SOCKET_STATE.CONNECTING}
								/>
								<div
									class="additional-autodetect-setting"
									class:disabled={$centrifugoState !== SOCKET_STATE.OPEN}
								>
									<span>Минимальный донат</span>
									<NumberInput
										--input-p="10.5px"
										--input-w-w="90px"
										--input-w="100%"
										--input-text-al="start"
										id="donationalerts-min-value"
										suffix="Руб"
										isFilled={false}
										isBorderless={false}
										isDisabled={$centrifugoState !== SOCKET_STATE.OPEN}
										bind:value={$minDonationValue}
									/>
								</div>
							</div>
						{/if}
					</div>
					<SettingSection title="Плеер">
						<SwitchSetting
							title="Автовоспроизведение"
							description="Автоматически воспроизводить видео"
							on={() => isAutoplay.set(true)}
							off={() => isAutoplay.set(false)}
							isToggled={$isAutoplay}
						/>
					</SettingSection>
					<SettingSection title="Голоса">
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
					</SettingSection>
					<SettingSection title="Очередь">
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
					</SettingSection>

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
		padding: 10px 10px 25px 10px;
		color: var(--on-surface);
		overflow-y: auto;
	}

	.connections {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 25px;
		padding: 20px;
		color: var(--on-surface-variant);
	}

	.additional-autodetect-setting {
		display: flex;
		flex: 1;
		justify-content: space-between;
		align-items: center;
		font-size: 0.9rem;
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
		margin-top: 50px;
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
