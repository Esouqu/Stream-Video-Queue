<script lang="ts">
	import queue from '$lib/stores/queue';
	import Tabs from '$lib/components/Tabs.svelte';
	import VideoPlayer from '$lib/components/VideoPlayer.svelte';
	import chat from '$lib/stores/chat';
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
	import centrifugo from '$lib/stores/centrifugo';
	import donationAlertsIcon from '$lib/assets/donationalerts-logo/DA_Alert_White.svg';
	import boostyIcon from '$lib/assets/boosty_logo/White.svg';
	import Auth from '$lib/components/Auth.svelte';
	import SettingSection from '$lib/components/SettingSection.svelte';
	import Snackbar from '$lib/components/Snackbar.svelte';
	import SettingWrapper from '$lib/components/SettingWrapper.svelte';
	import Switch from '$lib/components/Switch.svelte';
	import ButtonSelect from '$lib/components/ButtonSelect.svelte';
	import VideoPreview from '$lib/components/VideoPreview.svelte';
	import QueueItem from '$lib/components/QueueItem.svelte';
	import telegramIcon from '$lib/assets/telegram-logo/telegram-icon.svg';
	import timerIcon from '$lib/assets/timer_icon.svg';
	import playerIcon from '$lib/assets/player_icon.svg';
	import queueIcon from '$lib/assets/queue_icon.svg';
	import timer from '$lib/stores/timer';

	let twitchChannel = $page.data.twitchChannel;
	let donationAlertsUser = $page.data.donationAlertsUser;
	let currentTab: number;
	let scrollElement: HTMLDivElement;
	let currentSkipValue = 0;

	$: hhmmss = timer.hhmmss;
	$: donationAlertsSettings = settings.donationalerts;
	$: playerSettings = settings.player;
	$: queueSettings = settings.queue;
	$: timerSettings = settings.timer;
	$: twitchSettings = settings.twitch;
	$: currentVideo = queue.currentVideo;
	$: votesDifference = votes.difference;
	$: chatState = chat.state;
	$: centrifugoState = centrifugo.state;
	$: {
		const isChatConnected = $chatState === CHAT_STATE.CONNECTED;
		const isEnoughVotes = $votesDifference >= $twitchSettings.votes.needed;

		if ($twitchSettings.shouldAutoSkip && isChatConnected && isEnoughVotes) queue.setNext();
	}
	$: tabs = [`Очередь (${$queue.length})`, 'Настройки'];
	$: {
		const skipValue = $donationAlertsSettings.skipAction.value;
		const skipValueType = $donationAlertsSettings.skipAction.type;
		const dynamicSkipValue = $currentVideo ? (skipValue / 100) * $currentVideo.price : 0;
		const skipPrice = skipValueType === 'fixed' ? skipValue : dynamicSkipValue;

		currentSkipValue = skipPrice;
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
		<!-- <h1 style="color: white;">{$hhmmss}</h1> -->
		<Tabs options={tabs} {onTabChange} bind:currentTab />
		<div class="transition-container">
			{#if currentTab === 0}
				<div class="section-wrapper" transition:fly={{ x: -200, duration: 300 }}>
					<div
						class="available-actions"
						class:collapsed={$centrifugoState !== SOCKET_STATE.OPEN &&
							$chatState !== CHAT_STATE.CONNECTED}
					>
						{#if $centrifugoState === SOCKET_STATE.OPEN}
							{#if $donationAlertsSettings.linkAction.isEnabled}
								<Snackbar --snackbar-p="8px">
									<SettingWrapper title="Заказать" isAdditional={true}>
										<span style="white-space: nowrap;">
											от {$donationAlertsSettings.linkAction.value}
											{$timerSettings.type === 'fixed' ? 'руб' : 'руб/мин'}
										</span>
									</SettingWrapper>
								</Snackbar>
							{/if}
							{#if $donationAlertsSettings.skipAction.isEnabled}
								<Snackbar --snackbar-p="8px">
									<SettingWrapper title="Пропустить" isAdditional={true}>
										<span style="white-space: nowrap;">{currentSkipValue} руб</span>
									</SettingWrapper>
								</Snackbar>
							{/if}
						{/if}
						{#if $chatState === CHAT_STATE.CONNECTED}
							{#if $twitchSettings.isLinksEnabled}
								<Snackbar --snackbar-p="8px">
									<SettingWrapper title="Twitch ссылки" isAdditional={true}>
										<Indicator isActive={$twitchSettings.isLinksEnabled} />
									</SettingWrapper>
								</Snackbar>
							{/if}
							{#if $twitchSettings.isVotesEnabled}
								<Snackbar --snackbar-p="8px">
									<SettingWrapper title="Twitch голоса" isAdditional={true}>
										<Indicator isActive={$twitchSettings.isVotesEnabled} />
									</SettingWrapper>
								</Snackbar>
							{/if}
						{/if}
					</div>
					<Queue
						items={$queue}
						shouldSort={$queueSettings.shouldSortPaidVideos}
						bind:scrollElement
						let:item
					>
						{@const { id, videoId, position, startSeconds, isPaid, channelTitle, ...rest } = item}
						{@const isCurrentVideo = $currentVideo?.id === item.id}

						<QueueItem isSelected={isCurrentVideo} onDelete={() => queue.remove(item)}>
							<VideoPreview
								{...rest}
								isSelected={isCurrentVideo}
								on:click={() => !isCurrentVideo && queue.setCurrent(item)}
							/>
						</QueueItem>
					</Queue>
				</div>
			{:else if currentTab === 1}
				<div class="section-wrapper" transition:fly={{ x: 200, duration: 300 }}>
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
									<Snackbar>
										<SettingWrapper title="Отслеживать донаты">
											<Switch
												on={() => donationAlertsUser && centrifugo.connect(donationAlertsUser)}
												off={() => centrifugo.disconnect()}
												isToggled={$centrifugoState === SOCKET_STATE.OPEN}
												isDisabled={$centrifugoState === SOCKET_STATE.CONNECTING}
											/>
										</SettingWrapper>
									</Snackbar>
									<Snackbar isDisabled={$centrifugoState !== SOCKET_STATE.OPEN}>
										<SettingWrapper
											title="Заказ видео"
											description="Оплаченные видео будут находиться выше остальных"
										>
											<Switch bind:isToggled={$donationAlertsSettings.linkAction.isEnabled} />
										</SettingWrapper>
										<SettingWrapper title="Стоимость" isAdditional={true}>
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
												bind:value={$donationAlertsSettings.linkAction.value}
											/>
										</SettingWrapper>
									</Snackbar>
									<Snackbar isDisabled={$centrifugoState !== SOCKET_STATE.OPEN}>
										<SettingWrapper
											title="Пропуск видео"
											description="Пропускать текущее видео, если сумма доната равна указанному значению и в сообщении доната нет ссылки на Youtube видео"
										>
											<Switch bind:isToggled={$donationAlertsSettings.skipAction.isEnabled} />
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
												bind:currentOption={$donationAlertsSettings.skipAction.type}
											/>
										</SettingWrapper>
										<SettingWrapper title="Стоимость" isAdditional={true}>
											<NumberInput
												--input-p="10.5px"
												--input-w-w="90px"
												--input-w="100%"
												--input-text-al="start"
												id="donation-skip"
												suffix={$donationAlertsSettings.skipAction.type === 'fixed' ? 'руб' : '%'}
												placeholder="Значение"
												isFilled={false}
												isBorderless={false}
												bind:value={$donationAlertsSettings.skipAction.value}
											/>
										</SettingWrapper>
									</Snackbar>
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
								<SettingSection>
									<Snackbar>
										<SettingWrapper
											title="Отслеживать"
											description="Обрабатывать сообщения из чата с указанными настройками"
										>
											<Switch
												on={() => twitchChannel && chat.connect(twitchChannel.login)}
												off={() => chat.disconnect()}
												isToggled={$chatState === CHAT_STATE.CONNECTED}
												isDisabled={$chatState === CHAT_STATE.CONNECTING}
											/>
										</SettingWrapper>
										<SettingWrapper title="Youtube ссылки" isAdditional={true}>
											<Switch
												isDisabled={$chatState !== CHAT_STATE.CONNECTED}
												bind:isToggled={$twitchSettings.isLinksEnabled}
											/>
										</SettingWrapper>
										<SettingWrapper
											title="Голоса"
											description="Возможность голосовать за пропуск текущего видео указанными словами"
											isAdditional={true}
										>
											<Switch
												isDisabled={$chatState !== CHAT_STATE.CONNECTED}
												bind:isToggled={$twitchSettings.isVotesEnabled}
											/>
										</SettingWrapper>
									</Snackbar>
									<Snackbar isDisabled={$chatState !== CHAT_STATE.CONNECTED}>
										<SettingWrapper
											title="Автопропуск"
											description="Автоматически пропускать видео, если набранно достаточное количество голосов"
										>
											<Switch bind:isToggled={$twitchSettings.shouldAutoSkip} />
										</SettingWrapper>
									</Snackbar>
								</SettingSection>
							{/if}
						</div>
						<SettingSection icon={playerIcon} title="Плеер">
							<Snackbar>
								<SettingWrapper
									title="Автовоспроизведение"
									description="Автоматически воспроизводить видео"
								>
									<Switch bind:isToggled={$playerSettings.shouldAutoplay} />
								</SettingWrapper>
							</Snackbar>
							<Snackbar>
								<SettingWrapper
									title="Автопереход"
									description="Автоматически переходить на следующее видео по окончанию текущего"
								>
									<Switch bind:isToggled={$playerSettings.shouldPlayNextVideo} />
								</SettingWrapper>
							</Snackbar>
						</SettingSection>
						<SettingSection icon={queueIcon} title="Очередь">
							<Snackbar>
								<SettingWrapper
									title="Добавлять случайно"
									description={`Добавлять новое видео в случайном порядке`}
								>
									<Switch bind:isToggled={$queueSettings.shouldAddRandomly} />
								</SettingWrapper>
							</Snackbar>
							<Snackbar>
								<SettingWrapper
									title="Сортировать по цене"
									description="Если активно, то 'Добавлять случайно' не будет работать на платные видео"
								>
									<Switch bind:isToggled={$queueSettings.shouldSortPaidVideos} />
								</SettingWrapper>
							</Snackbar>
							<Snackbar>
								<SettingWrapper
									title="Удалять просмотренное"
									description="Удалять текущее видео из очереди перед переходом на следующее"
								>
									<Switch bind:isToggled={$queueSettings.shouldDeletePreviousVideo} />
								</SettingWrapper>
							</Snackbar>
							<Button
								--button-bg="var(--surface-variant)"
								title="Очистить очередь"
								isDisabled={$queue.length < 1}
								on:click={() => queue.removeAll()}
							/>
						</SettingSection>
						<SettingSection icon={timerIcon} title="Таймер">
							<Snackbar>
								<SettingWrapper title="Отсчитывать время">
									<Switch bind:isToggled={$timerSettings.isEnabled} />
								</SettingWrapper>
								<SettingWrapper
									title="Тип стоимости"
									description={`От стоимости - время будет расчитываться в зависимости от стоимости заказа видео\n(т.е. ${$donationAlertsSettings.linkAction.value} руб/мин, на данный момент)`}
									isAdditional={true}
									isVertical={true}
								>
									<ButtonSelect
										options={[
											{ title: 'Фиксированно', value: 'fixed' },
											{ title: 'От стоимости', value: 'perMinute' }
										]}
										bind:currentOption={$timerSettings.type}
										onOptionChange={(value) => {
											const SECONDS = 60;
											if (value === 'perMinute') $timerSettings.value = SECONDS;
										}}
									/>
								</SettingWrapper>
								<SettingWrapper title="Секунды" isAdditional={true}>
									<NumberInput
										--input-p="10.5px"
										--input-w-w="90px"
										--input-w="100%"
										--input-text-al="start"
										id="timer-value"
										suffix="сек"
										isFilled={false}
										isBorderless={false}
										isDisabled={$timerSettings.type === 'perMinute'}
										bind:value={$timerSettings.value}
									/>
								</SettingWrapper>
							</Snackbar>
						</SettingSection>
					</div>
					<div class="bottom-wrapper">
						<Contact icon={githubIcon} title="GitHub" url="https://github.com/Esouqu" />
						<Contact icon={telegramIcon} title="Telegram" url="https://t.me/esouqu" />
						<Contact icon={boostyIcon} title="Boosty" url="https://boosty.to/esouqu/donate" />
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

	.section-wrapper {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
	}
	.settings-wrapper {
		display: flex;
		flex: 1;
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
		gap: 12px;
		margin: 25px 0;
		color: var(--on-surface-variant);
	}

	.available-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 6px;
		margin: 16px 8px;

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
