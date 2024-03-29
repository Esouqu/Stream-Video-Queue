<script lang="ts">
	export let icon: string = '';
	export let title: string;
</script>

<div class="setting-section">
	<div style="display: flex; align-items: center; gap: 15px;">
		{#if icon}
			<div class="setting-section-image-wrapper">
				<img src={icon} alt="Setting Section Icon" />
			</div>
		{/if}
		<h3>{title}</h3>
	</div>
	<div class="setting-section-inner">
		<slot />
	</div>
</div>

<style lang="scss">
	.setting-section {
		&-inner {
			display: flex;
			flex-direction: column;
			gap: 10px;
			padding: 0 10px;
		}

		&-image-wrapper {
			display: flex;
			min-width: 25px;
			width: 25px;
			overflow: hidden;

			& img {
				width: 100%;
				object-fit: contain;
			}
		}
	}
</style>
