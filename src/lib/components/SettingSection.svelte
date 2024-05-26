<script lang="ts">
	export let icon: string = '';
	export let title: string = '';
</script>

<div class="setting-section">
	<div style="display: flex; align-items: center; gap: 15px; margin-bottom: 16px;">
		{#if icon}
			<div class="icon-wrapper" style="width: 30px; height: 30px;">
				<img src={icon} alt="Setting Section Icon" />
			</div>
		{/if}
		{#if title}
			<h3 style="margin: 0;">{title}</h3>
		{/if}
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
			gap: 8px;
		}
	}
</style>
