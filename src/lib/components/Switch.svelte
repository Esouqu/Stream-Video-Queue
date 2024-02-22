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
	class:enabled={isToggled}
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
		width: 48px;
		min-width: 48px;
		height: 25px;
		background-color: var(--neutral);
		opacity: 1;
		transition: 0.2s;
		cursor: pointer;

		&.loading {
			width: 25px;
			min-width: 25px;
			background-color: var(--switch-color, var(--primary-60));

			&::after {
				left: 50% !important;
				top: 50%;
				translate: -50% -50%;
			}
		}

		&:disabled {
			opacity: 0.5;
			cursor: default;
		}
		&::after {
			content: '';
			position: absolute;
			left: 15%;
			top: 50%;
			translate: 0 -50%;
			border-radius: 50%;
			width: 12px;
			height: 12px;
			box-shadow: 0 1px 2px black;
			background-color: white;
			transition: 0.2s;
		}

		&.enabled {
			background-color: var(--switch-color, var(--primary-60));

			&::after {
				left: 60%;
			}
		}
	}
</style>
