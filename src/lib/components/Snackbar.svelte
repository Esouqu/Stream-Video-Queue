<script lang="ts">
	export let isDisabled = false;
</script>

<div class="snackbar" class:disabled={isDisabled}>
	<div class="snackbar-inner">
		<slot />
	</div>
</div>

<style lang="scss">
	.snackbar {
		position: relative;
		display: flex;
		flex-direction: column;
		border-radius: 5px;
		width: 100%;
		box-shadow: var(--elevation-1);
		font-weight: 500;
		font-variant-numeric: tabular-nums;
		color: var(--on-surface);
		overflow: hidden;

		&-inner {
			z-index: 0;
			display: flex;
			flex-direction: column;
			gap: 15px;
			padding: var(--snackbar-p, 16px);
		}

		&.disabled {
			opacity: 0.5;
			pointer-events: none;
		}

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background-color: var(--surface-container-low);
		}
	}
</style>
