<script lang="ts">
	export let isToggled = false;
	export let isDisabled = false;
	export let isLoading = false;
	export let on: (() => void) | null = null;
	export let off: (() => void) | null = null;

	function onToggle() {
		isToggled = !isToggled;

		if (on && isToggled) on();
		if (off && !isToggled) off();
	}
</script>

<button
	type="button"
	class="switch"
	class:enabled={isToggled && !isLoading}
	class:loading={isLoading}
	disabled={isDisabled}
	on:click={onToggle}
/>

<style lang="scss">
	.switch {
		position: relative;
		padding: 0;
		border: 0;
		border-radius: 30px;
		width: 42px;
		min-width: 42px;
		height: 24px;
		background-color: var(--neutral);
		opacity: 1;
		transition: 0.2s;
		cursor: pointer;

		&.loading {
			background-color: var(--neutral);
			opacity: 0.3;
		}

		&:disabled {
			opacity: 0.5;
			cursor: default;
		}
		&::after {
			content: '';
			position: absolute;
			display: flex;
			translate: 3px -50%;
			border-radius: 50%;
			width: 18px;
			height: 18px;
			box-shadow: 0 1px 0 black;
			background-color: white;
			transition: 0.2s;
		}

		&.enabled {
			background-color: var(--switch-color, var(--primary-60));

			&::after {
				translate: 21px -50%;
			}
		}
	}
</style>
