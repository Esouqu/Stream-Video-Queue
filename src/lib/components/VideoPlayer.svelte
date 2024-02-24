<script lang="ts">
	import videoPlayer from '$lib/stores/videoPlayer';
	import { onMount } from 'svelte';
	import YouTubePlayer from 'youtube-player';
	import votes from '$lib/stores/votes';
	import queue from '$lib/stores/queue';
	import { clamp } from '$lib/utils';
	import Button from './Button.svelte';
	import Votes from './Votes.svelte';
	import { fade } from 'svelte/transition';
	import settings from '$lib/stores/settings';
	import skipIcon from '$lib/assets/skip_next_icon.svg';
	import copyIcon from '$lib/assets/content_copy_icon.svg';
	import AutoIndicator from './AutoIndicator.svelte';

	let playerElement: HTMLElement;
	let title: string;
	let username: string;
	let channelTitle: string;

	$: userInput = settings.userInput;
	$: isAutoskip = settings.isAutoskip;
	$: votesDifference = votes.difference;
	$: progressPercent = clamp(($votesDifference / $userInput.needed) * 100, 0, 100);
	$: currentVideo = queue.currentVideo;
	$: {
		if ($currentVideo) {
			title = $currentVideo.title;
			channelTitle = $currentVideo.channelTitle;
			username = `Заказавший: ${$currentVideo.username}`;
		} else {
			title = ` `;
			channelTitle = ` `;
			username = ` `;
		}
	}

	onMount(async () => {
		videoPlayer.initialize(YouTubePlayer(playerElement, { playerVars: { rel: 0 } }));
	});

	async function copyVideoUrlToClipboard() {
		const url = await videoPlayer.getVideoUrl();

		navigator.clipboard.writeText(url);
	}
</script>

<div class="video-player">
	<div class="youtube-player-container" class:visible={!!$currentVideo}>
		<div class="youtube-player" bind:this={playerElement} />
	</div>
	<div class="box-placeholder" class:visible={!$currentVideo} />

	<div class="video-player-bottom-section">
		{#key $currentVideo}
			<div class="video-player-info" in:fade={{ duration: 300 }}>
				<h2 class="video-player-title" {title}>{title}</h2>
			</div>
		{/key}
		<div style="display: flex;">
			{#key $currentVideo}
				<div class="video-player-info" in:fade={{ duration: 300 }}>
					<p class="video-player-channel">
						{channelTitle}
					</p>
					<p class="video-player-username">
						{username}
					</p>
				</div>
			{/key}
			<div style="display: flex; align-items: center; flex: 0 1 auto; gap: 10px;">
				<Button
					icon={copyIcon}
					title="Ссылка"
					isDisabled={$queue.length < 1}
					on:click={copyVideoUrlToClipboard}
				/>
				<Votes />
				<div style="position: relative;">
					{#if $isAutoskip}
						<AutoIndicator />
					{/if}
					<Button
						--button-progress="{isNaN(progressPercent) ? 0 : progressPercent}%"
						icon={skipIcon}
						title="Следущее"
						isDisabled={$queue.length < 1}
						on:click={() => queue.setNext()}
					/>
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.video-player {
		display: flex;
		flex-direction: column;
		margin: 20px;

		&-bottom-section {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			width: 100%;
		}
		&-info {
			display: flex;
			flex-direction: column;
			flex: 1;
			color: var(--on-surface);
			overflow: hidden;
		}
		&-username {
			margin: 0;
			font-weight: 300;
			font-size: 14px;
			white-space: pre;
			text-overflow: ellipsis;
			overflow: hidden;
		}
		&-channel {
			margin: 0;
			font-weight: 500;
			line-height: 22px;
			white-space: pre;
			text-overflow: ellipsis;
			overflow: hidden;
		}
		&-title {
			font-size: 20px;
			font-weight: 700;
			line-height: 1.2;
			white-space: pre;
			text-overflow: ellipsis;
			overflow: hidden;
		}
	}
	.youtube-player {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		width: 100%;
		height: 100%;

		&-container {
			position: relative;
			width: 100%;
			height: 100%;
			overflow: hidden;

			&:not(.visible) {
				display: none;
			}
		}
	}
	.box-placeholder {
		width: 100%;
		height: 100%;
		background-color: rgba(255 255 255 / 5%);

		&:not(.visible) {
			display: none;
		}
	}
</style>
