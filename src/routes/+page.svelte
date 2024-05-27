<script lang="ts">
	import queue from '$lib/stores/queue';
	import Tabs from '$lib/components/Tabs.svelte';
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
	import NumberInput from '$lib/components/NumberInput.svelte';
	import Contact from '$lib/components/Contact.svelte';
	import githubIcon from '$lib/assets/github-mark/github-mark-white.svg';
	import discordIcon from '$lib/assets/discord-logo/icon_clyde_white_RGB.svg';
	import centrifugo from '$lib/centrifugo';
	import donationAlertsIcon from '$lib/assets/donationalerts-logo/DA_Alert_White.svg';
	import boostyIcon from '$lib/assets/boosty_logo/White.svg';
	import Auth from '$lib/components/Auth.svelte';
	import SettingSection from '$lib/components/SettingSection.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import DonateKit from '$lib/components/DonateKit.svelte';
	import settingsIcon from '$lib/assets/settings_icon.svg';
	import Snackbar from '$lib/components/Snackbar.svelte';
	import SettingWrapper from '$lib/components/SettingWrapper.svelte';
	import Switch from '$lib/components/Switch.svelte';
	import ButtonSelect from '$lib/components/ButtonSelect.svelte';

	let twitchChannel = $page.data.twitchChannel;
	let donationAlertsUser = $page.data.donationAlertsUser;
	let currentTab: number;
	let scrollElement: HTMLDivElement;
	let currentSkipValue = 0;

	$: donationSkip = settings.donationSkip;
	$: isAutoskip = settings.isAutoskip;
	$: isAutoplay = settings.isAutoplay;
	$: isAutoskipOnEnd = settings.isAutoskipOnEnd;
	$: isAutodetection = settings.isAutodetection;
	$: isVotesEnabled = settings.isVotesEnabled;
	$: isLinksEnabled = settings.isLinksEnabled;
	$: isDonationEnabled = settings.isDonationEnabled;
	$: shouldSortPaidVideos = settings.shouldSortPaidVideos;
	$: shouldDeletePreviousVideos = settings.shouldDeletePreviousVideos;
	$: percentFromViewCount = settings.percentFromViewCount;
	$: minDonationValue = settings.minDonationValue;
	$: isAddRandomly = settings.isAddRandomly;
	$: userInput = settings.userInput;
	$: currentVideo = queue.currentVideo;
	$: votesDifference = votes.difference;
	$: chatState = chat.state;
	$: centrifugoState = centrifugo.state;
	$: {
		const isChatConnected = $chatState === CHAT_STATE.CONNECTED;
		const isEnoughVotes = $votesDifference >= $userInput.needed;

		if ($isAutoskip && isChatConnected && isEnoughVotes) queue.setNext();
	}
	$: tabs = [`Очередь (${$queue.length})`, 'Настройки'];
	$: {
		if (!$currentVideo && $donationSkip.type === 'percent') {
			currentSkipValue = 0;
		} else if ($donationSkip.type === 'fixed') {
			currentSkipValue = $donationSkip.value;
		} else if ($currentVideo && $donationSkip.type === 'percent') {
			currentSkipValue = ($donationSkip.value / 100) * $currentVideo.price;
		}
	}

	function onNextVideo(videoId: number) {
		scrollElement.scrollTo({
			top: videoId * 80,
			behavior: 'smooth'
		});
	}

	function onTabChange(tabIdx: number) {
		if (tabIdx === 0) {
			const currentVideoId = $queue.findIndex((item) => item.id === $currentVideo?.id);

			setTimeout(() => {
				scrollElement.scrollTo({ top: currentVideoId * 80, behavior: 'smooth' });
			}, 300);
		}
	}
</script>

<svelte:head>
	<title>Stream Video Queue</title>
</svelte:head>

<div class="main-page">
	<VideoPlayer {onNextVideo} />
	<div class="right-side">
		<Tabs options={tabs} {onTabChange} bind:currentTab />
		<div class="transition-container">
			{#if currentTab === 0}
				<div
					style="display: flex; flex-direction: column; height: 100%; overflow: hidden;"
					transition:fly={{ x: -200, duration: 300 }}
				>
					<!-- <DonateKit /> -->
					<div
						class="available-actions"
						class:collapsed={!$isDonationEnabled &&
							!$donationSkip.isEnabled &&
							!$isLinksEnabled &&
							!$isVotesEnabled}
					>
						{#if $isDonationEnabled}
							<Snackbar>
								<SettingWrapper title="Заказать" isAdditional={true}>
									<span style="white-space: nowrap;">от {$minDonationValue} руб</span>
								</SettingWrapper>
							</Snackbar>
						{/if}
						{#if $donationSkip.isEnabled}
							<Snackbar>
								<SettingWrapper title="Пропустить" isAdditional={true}>
									<span style="white-space: nowrap;">{currentSkipValue} руб</span>
								</SettingWrapper>
							</Snackbar>
						{/if}
						{#if $isLinksEnabled}
							<Snackbar>
								<SettingWrapper title="Twitch ссылки" isAdditional={true}>
									<Indicator isActive={$isLinksEnabled} />
								</SettingWrapper>
							</Snackbar>
						{/if}
						{#if $isVotesEnabled}
							<Snackbar>
								<SettingWrapper title="Twitch голоса" isAdditional={true}>
									<Indicator isActive={$isVotesEnabled} />
								</SettingWrapper>
							</Snackbar>
						{/if}
					</div>
					<Queue bind:scrollElement />
				</div>
			{:else if currentTab === 1}
				<div
					style="display: flex; flex-direction: column; height: 100%; overflow: hidden;"
					transition:fly={{ x: 200, duration: 300 }}
				>
					<div class="settings-wrapper">
						<div>
							<Auth
								icon={donationAlertsIcon}
								title="DonationAlerts"
								userName={donationAlertsUser?.name}
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
										<Snackbar>
											<SettingWrapper
												title="Отслеживать Youtube ссылки"
												description="Оплаченные видео будут находиться выше остальных"
											>
												<Switch bind:isToggled={$isDonationEnabled} />
											</SettingWrapper>
											<SettingWrapper title="Минимальная стоимость" isAdditional={true}>
												<NumberInput
													--input-p="10.5px"
													--input-w-w="90px"
													--input-w="100%"
													--input-text-al="start"
													id="donation-video-price"
													suffix="руб"
													placeholder="Значение"
													isFilled={false}
													isBorderless={false}
													bind:value={$minDonationValue}
												/>
											</SettingWrapper>
										</Snackbar>
										<Snackbar>
											<SettingWrapper
												title="Пропуск"
												description="Пропускать текущее видео, если сумма доната равна указанному значению и в сообщении доната нет ссылки на Youtube видео"
											>
												<Switch bind:isToggled={$donationSkip.isEnabled} />
											</SettingWrapper>
											<SettingWrapper
												title="Тип стоимости"
												description="Динамическая - процент от стоимости текущего видео"
												isAdditional={true}
												isVertical={true}
											>
												<ButtonSelect
													options={[
														{ title: 'Фиксированная', value: 'fixed' },
														{ title: 'Динамическая', value: 'percent' }
													]}
													bind:currentOption={$donationSkip.type}
												/>
											</SettingWrapper>
											<SettingWrapper title="Стоимость" isAdditional={true}>
												<NumberInput
													--input-p="10.5px"
													--input-w-w="90px"
													--input-w="100%"
													--input-text-al="start"
													id="donation-skip"
													suffix={$donationSkip.type === 'fixed' ? 'руб' : '%'}
													placeholder="Значение"
													isFilled={false}
													isBorderless={false}
													bind:value={$donationSkip.value}
												/>
											</SettingWrapper>
										</Snackbar>
									{/if}
								</SettingSection>
							{/if}
						</div>
						<div>
							<Auth
								icon={twitchIcon}
								title="Twitch"
								userName={twitchChannel?.display_name}
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
										<Snackbar>
											<SettingWrapper title="Отслеживать Youtube ссылки">
												<Switch bind:isToggled={$isLinksEnabled} />
											</SettingWrapper>
										</Snackbar>
										<Snackbar>
											<SettingWrapper title="Отслеживать голоса">
												<Switch bind:isToggled={$isVotesEnabled} />
											</SettingWrapper>
										</Snackbar>
										<Snackbar isDisabled={!$isVotesEnabled}>
											<SettingWrapper
												title="Автопропуск"
												description="Автоматически пропускать видео, если набранно достаточное количество голосов"
											>
												<Switch bind:isToggled={$isAutoskip} />
											</SettingWrapper>
										</Snackbar>

										<Snackbar isDisabled={!$isVotesEnabled}>
											<SettingWrapper
												title="Автоопределение"
												description="Автоматически определять нужное количество голосов в зависимости от указанного значения, не чаще, чем раз в 2 минуты"
											>
												<Switch bind:isToggled={$isAutodetection} />
											</SettingWrapper>
											<SettingWrapper title="Процент от зрителей" isAdditional={true}>
												<NumberInput
													--input-p="10.5px"
													--input-w-w="90px"
													--input-w="100%"
													--input-text-al="start"
													id="autodetection-percent"
													suffix="%"
													placeholder="Значение"
													isFilled={false}
													isBorderless={false}
													bind:value={$percentFromViewCount}
												/>
											</SettingWrapper>
										</Snackbar>
									</SettingSection>
								{/if}
							{/if}
						</div>
						<SettingSection icon={settingsIcon} title="Основные">
							<Snackbar>
								<SettingWrapper
									title="Автовоспроизведение"
									description="Автоматически воспроизводить видео"
								>
									<Switch bind:isToggled={$isAutoplay} />
								</SettingWrapper>
							</Snackbar>
							<Snackbar>
								<SettingWrapper
									title="Автопереход"
									description="Автоматически переходить на следующее видео по окончанию текущего"
								>
									<Switch bind:isToggled={$isAutoskipOnEnd} />
								</SettingWrapper>
							</Snackbar>
							<Snackbar>
								<SettingWrapper
									title="Добавлять случайно"
									description={`Добавлять новое видео в случайном порядке`}
								>
									<Switch bind:isToggled={$isAddRandomly} />
								</SettingWrapper>
							</Snackbar>
							<Snackbar>
								<SettingWrapper
									title="Сортировать по цене"
									description="Если активно, то 'Добавлять случайно' не будет работать на платные видео"
								>
									<Switch bind:isToggled={$shouldSortPaidVideos} />
								</SettingWrapper>
							</Snackbar>
							<Snackbar>
								<SettingWrapper
									title="Удалять просмотренное"
									description="Удалять текущее видео из очереди перед переходом на следующее"
								>
									<Switch bind:isToggled={$shouldDeletePreviousVideos} />
								</SettingWrapper>
							</Snackbar>
							<Button
								--button-bg="var(--surface-variant)"
								title="Очистить очередь"
								isDisabled={$queue.length < 1}
								on:click={() => queue.removeAll()}
							/>
						</SettingSection>
					</div>
					<div class="bottom-wrapper">
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
		gap: 32px;
		padding: 20px 15px;
		color: var(--on-surface);
		scrollbar-gutter: stable;
		overflow-y: auto;
	}

	.bottom-wrapper {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 20px;
		margin: 25px 0;
		color: var(--on-surface-variant);
	}

	.available-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 6px;
		margin: 16px 0;

		&.collapsed {
			margin: 0;
		}
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
