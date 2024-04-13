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
	import boostyIcon from '$lib/assets/boosty_logo/White.svg';
	import Auth from '$lib/components/Auth.svelte';
	import SettingSection from '$lib/components/SettingSection.svelte';
	import twitchApi from '$lib/twitchApi';
	import Spinner from '$lib/components/Spinner.svelte';
	import DonateKit from '$lib/components/DonateKit.svelte';

	let twitchChannel = $page.data.twitchChannel;
	let donationAlertsUser = $page.data.donationAlertsUser;
	let currentTab: number;
	let scrollElement: HTMLDivElement;

	$: isAutoskip = settings.isAutoskip;
	$: isAutoplay = settings.isAutoplay;
	$: isAutoskipOnEnd = settings.isAutoskipOnEnd;
	$: isAutodetection = settings.isAutodetection;
	$: isVotesEnabled = settings.isVotesEnabled;
	$: isLinksEnabled = settings.isLinksEnabled;
	$: isDonationEnabled = settings.isDonationEnabled;
	// $: isPaidVideosSkippable = settings.isPaidVideosSkippable;
	$: percentFromViewCount = settings.percentFromViewCount;
	$: minDonationValue = settings.minDonationValue;
	$: isAddRandomly = settings.isAddRandomly;
	$: userInput = settings.userInput;
	$: votesDifference = votes.difference;
	$: chatState = chat.state;
	$: centrifugoState = centrifugo.state;
	$: {
		const isChatConnected = $chatState === CHAT_STATE.CONNECTED;
		const isEnoughVotes = $votesDifference >= $userInput.needed;

		if ($isAutoskip && isChatConnected && isEnoughVotes) queue.setNext();
	}
	$: tabs = [`Очередь (${$queue.length})`, 'Настройки'];
	$: twitchConnectionName = getTwitchSettingsName($isVotesEnabled, $isLinksEnabled);

	onMount(() => {
		if (twitchChannel) {
			twitchApi.validateTokenWithInterval();
			chat.initialize(twitchChannel.login);
		}

		if (donationAlertsUser) {
			centrifugo.connect(donationAlertsUser);
		}

		initializeSubscriptions();
	});

	function getTwitchSettingsName(votes: boolean, links: boolean) {
		if (votes && links) return 'Голоса и Cсылки';
		if (votes) return 'Только Голоса';
		if (links) return 'Только Ссылки';

		return 'Ничего';
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
	<div class="right-side">
		<Tabs options={tabs} bind:currentTab />
		<div class="transition-container">
			{#if currentTab === 0}
				<div
					style="display: flex; flex-direction: column; height: 100%; overflow: hidden;"
					transition:fly={{ x: -200, duration: 300 }}
				>
					<!-- <DonateKit /> -->
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
							{#if $isVotesEnabled || $isLinksEnabled}
								<span>{twitchConnectionName}</span>
							{/if}
							<Indicator isActive={$isVotesEnabled || $isLinksEnabled} />
						</div>
						<div
							style="display: flex;
							align-items: center;
							gap: 10px;"
						>
							<div style="display: flex; align-items: center; width: 25px;">
								<img src={donationAlertsIcon} alt="Twitch Brand Icon" />
							</div>
							{#if $isDonationEnabled}
								<span>Донаты</span>
							{/if}
							<Indicator isActive={$isDonationEnabled} />
						</div>
					</div>
				</div>
			{:else if currentTab === 1}
				<div class="settings-wrapper" transition:fly={{ x: 200, duration: 300 }}>
					<div>
						<div>
							<Auth
								icon={twitchIcon}
								title={twitchChannel ? `Twitch (${twitchChannel.display_name})` : 'Twitch'}
								url="/api/twitch/auth"
								isLoggedIn={!!twitchChannel}
								onLogout={() => {
									fetch('/api/twitch/logout');
									twitchChannel = undefined;
								}}
							/>
							{#if twitchChannel}
								{#if $chatState === CHAT_STATE.CONNECTING}
									<Spinner />
								{:else if $chatState === CHAT_STATE.CONNECTED}
									<SettingSection>
										<SwitchSetting
											title="Ссылки"
											description="Отслеживать ссылки на Youtube"
											on={() => isLinksEnabled.set(true)}
											off={() => isLinksEnabled.set(false)}
											isToggled={$isLinksEnabled}
										/>
										<SwitchSetting
											title="Голоса"
											description="Отслеживать голоса"
											on={() => isVotesEnabled.set(true)}
											off={() => isVotesEnabled.set(false)}
											isToggled={$isVotesEnabled}
										/>
										<SwitchSetting
											title="Автопропуск"
											description="Автоматически пропускать видео, если набранно достаточное количество голосов"
											on={() => isAutoskip.set(true)}
											off={() => isAutoskip.set(false)}
											isToggled={$isAutoskip}
											isDisabled={!$isVotesEnabled}
										/>
										<div>
											<SwitchSetting
												title="Автоопределение"
												description="Автоматически определять нужное количество голосов в зависимости от указанного значения, не чаще, чем раз в 2 минуты"
												on={() => isAutodetection.set(true)}
												off={() => isAutodetection.set(false)}
												isToggled={$isAutodetection}
												isDisabled={!$isVotesEnabled}
											/>
											<div class="additional-setting" class:disabled={!$isVotesEnabled}>
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
													isDisabled={!$isVotesEnabled}
													bind:value={$percentFromViewCount}
												/>
											</div>
										</div>
									</SettingSection>
								{/if}
							{/if}
						</div>
						<div>
							<Auth
								icon={donationAlertsIcon}
								title={donationAlertsUser
									? `DonationAlerts (${donationAlertsUser.name})`
									: 'DonationAlerts'}
								url="/api/donationalerts/auth"
								isLoggedIn={!!donationAlertsUser}
								onLogout={() => {
									fetch('/api/donationalerts/logout');
									donationAlertsUser = undefined;
								}}
							/>
							{#if donationAlertsUser}
								<SettingSection>
									{#if $centrifugoState === SOCKET_STATE.CONNECTING}
										<Spinner />
									{:else if $centrifugoState === SOCKET_STATE.OPEN}
										<div>
											<SwitchSetting
												title="Донаты"
												description={`Отслеживать ссылки на Youtube.\nОплаченные видео будут находиться выше остальных`}
												on={() => isDonationEnabled.set(true)}
												off={() => isDonationEnabled.set(false)}
												isToggled={$isDonationEnabled}
											/>
											<div class="additional-setting">
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
										<!-- <SwitchSetting
											title="Можно пропускать"
											description="Подсчитывать голоса для оплаченных видео"
											on={() => isPaidVideosSkippable.set(true)}
											off={() => isPaidVideosSkippable.set(false)}
											isToggled={$isPaidVideosSkippable}
											isDisabled={!$isVotesEnabled}
										/> -->
									{/if}
								</SettingSection>
							{/if}
						</div>
						<SettingSection title="Основные">
							<SwitchSetting
								title="Автовоспроизведение"
								description="Автоматически воспроизводить видео"
								on={() => isAutoplay.set(true)}
								off={() => isAutoplay.set(false)}
								isToggled={$isAutoplay}
							/>

							<SwitchSetting
								title="Автопереход по окончанию"
								description="Автоматически переходить на следующее видео по окончанию текущего"
								on={() => isAutoskipOnEnd.set(true)}
								off={() => isAutoskipOnEnd.set(false)}
								isToggled={$isAutoskipOnEnd}
							/>
							<SwitchSetting
								title="Добавлять Случайно"
								description="Добавлять новое видео в случайном порядке"
								on={() => isAddRandomly.set(true)}
								off={() => isAddRandomly.set(false)}
								isToggled={$isAddRandomly}
							/>
							<Button
								--button-bg="var(--surface-variant)"
								title="Очистить очередь"
								on:click={() => queue.removeAll()}
							/>
						</SettingSection>
					</div>

					<div class="contacts-wrapper">
						<Contact icon={boostyIcon} title="Поддержать" url="https://boosty.to/esouqu/donate" />
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

	.right-side {
		position: relative;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.settings-wrapper {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 10px 15px 25px 15px;
		color: var(--on-surface);
		scrollbar-gutter: stable;
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

	.additional-setting {
		display: flex;
		flex: 1;
		justify-content: space-between;
		align-items: center;
		font-size: 0.9rem;
		font-weight: 300;
		margin-top: 5px;

		&.disabled span {
			opacity: 0.5;
		}
	}

	.contacts-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 20px;
		margin-top: 30px;
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
