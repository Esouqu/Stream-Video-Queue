<script lang="ts">
	export let title: string;
</script>

<div class="setting-section">
	<h3>{title}</h3>
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
	}
</style>
