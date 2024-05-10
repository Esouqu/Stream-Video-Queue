<script lang="ts">
	export let title = '';
	export let icon = '';
	export let isDisabled = false;
</script>

<div class="button-wrapper" class:disabled={isDisabled}>
	<button class="button" on:click>
		{#if icon}
			<div class="icon-wrapper">
				<img src={icon} alt="Button Icon" draggable="false" />
			</div>
		{/if}
		{#if title}
			<span class="button__label">
				{title}
			</span>
		{/if}
	</button>
</div>

<style lang="scss">
	.button {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 5px;
		border: 0;
		padding: var(--button-p, 7px);
		height: 100%;
		width: 100%;
		color: var(--on-surface);
		background-color: transparent;
		transition: 0.2s;
		user-select: none;
		cursor: pointer;

		&:hover {
			background-color: var(--hover-white);
		}

		&-wrapper {
			display: flex;
			border-radius: 100px;
			background-color: var(--button-bg, var(--surface-container-high));
			height: var(--button-size, auto);
			min-width: var(--button-size, fit-content);
			width: var(--button-size, auto);
			overflow: hidden;

			&.disabled {
				opacity: 0.5;
				pointer-events: none;
			}
			&:active {
				scale: 0.95;
			}
		}

		&__label {
			z-index: 1;
		}

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			z-index: 0;
			width: var(--button-progress, 0);
			height: 100%;
			background-color: var(--primary-container);
			transition: 0.3s;
		}
	}
</style>
