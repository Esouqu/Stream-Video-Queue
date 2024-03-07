<script lang="ts">
	export let title: string;
	export let thumbnail: string;
	export let channelTitle: string;
	export let username: string;
</script>

<div class="video-preview" on:click aria-hidden>
	<div class="video-preview__thumbnail">
		<img src={thumbnail} alt="Video Thumbnail" draggable="false" />
	</div>
	<div class="video-preview__info">
		<p class="video-preview__title">{title}</p>
		<div>
			<p class="video-preview__channel">{channelTitle}</p>
			<p class="video-preview__username">Заказал: {username}</p>
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

		&__channel {
			margin: 0 0 -4px 0;
			font-size: 0.8rem;
			line-height: 18px;
			font-weight: 400;
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
	}
</style>
