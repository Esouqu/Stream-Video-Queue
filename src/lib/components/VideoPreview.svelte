<script lang="ts">
	import tooltip from '$lib/actions/tooltip';
	import settings from '$lib/stores/settings';
	import timer from '$lib/stores/timer';

	export let title: string;
	export let thumbnail: string;
	export let username: string;
	export let endSeconds: number | undefined = undefined;
	export let price = 0;
	export let message = '';
	export let isSelected = false;
	export let isWatched = false;

	$: hhmmss = timer.hhmmss;
	$: timerSettings = settings.timer;
	$: isTimerEnabled = $timerSettings.isEnabled;
</script>

<div
	class="video-preview"
	class:selected={isSelected}
	class:transparent={isWatched}
	aria-hidden
	use:tooltip={{ content: `Сообщение от ${username}\n${message}`, placement: 'left' }}
	on:click
>
	<div class="video-preview__thumbnail">
		<img src={thumbnail} alt="Video Thumbnail" draggable="false" />
	</div>
	<div class="video-preview__info">
		<p class="video-preview__title">{title}</p>
		<div>
			<p class="video-preview__username">Заказал: {username}</p>
			{#if price > 0}
				<div style="display: flex; gap: 5px;">
					<div class="video-preview__chip">{price} RUB</div>
					{#if isTimerEnabled && isSelected && endSeconds}
						<div class="video-preview__chip">{$hhmmss}</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	.video-preview {
		position: relative;
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 10px;
		width: 100%;
		height: 70px;

		&:not(.selected).transparent {
			opacity: 0.3;
		}

		&__thumbnail {
			position: relative;
			display: block;
			flex: none;
			width: 100px;
			height: 56px;
			user-select: none;
			overflow: hidden;

			& img {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}

		&__info {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			width: 100%;
		}

		&__title {
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			margin: 0;
			font-size: 0.9rem;
			line-height: 1.15rem;
			font-weight: 500;
			text-decoration: none;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		&__username {
			margin: 0;
			font-size: 0.8rem;
			line-height: 18px;
			font-weight: 400;
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
		}

		&__chip {
			padding: 0px 5px;
			border-radius: 4px;
			width: fit-content;
			font-size: 0.8rem;
			font-weight: 500;
			color: var(--on-surface);
			background-color: var(--primary-40);
		}

		// &.selected &__chip {
		// 	color: var(--on-surface);
		// 	background-color: var(--primary-50);
		// }
	}
</style>
