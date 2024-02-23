<script lang="ts">
	import Switch from '$lib/components/Switch.svelte';

	export let icon: string = '';
	export let title: string;
	export let description: string;
	export let on: () => void;
	export let off: () => void;
	export let isToggled = false;
	export let isDisabled = false;
	export let isLoading = false;
</script>

<div class="switch-setting">
	<!-- <div class="switch-setting-inner-wrapper"> -->
	{#if icon}
		<div class="switch-setting-image-wrapper">
			<img src={icon} alt="Twitch User" />
		</div>
	{/if}
	<div style="display: flex; flex-direction: column; width: 100%;">
		<span style="font-weight: 500; margin-bottom: 5px;">{title}</span>
		<span style="font-size: 14px; font-weight: 300; white-space: break-spaces;">{description}</span>
	</div>
	<div style="display: flex; justify-content: center; min-width: 48px;">
		<Switch {on} {off} bind:isToggled bind:isDisabled bind:isLoading />
	</div>
	<!-- </div> -->
</div>

<style lang="scss">
	.switch-setting {
		display: flex;
		align-items: center;
		gap: 15px;
		padding: 0 10px;
		color: var(--on-surface);

		// &-inner-wrapper {
		// 	display: flex;
		// 	align-items: center;
		// 	gap: 15px;
		// 	flex: 0 1 100%;
		// }

		&-image-wrapper {
			display: flex;
			min-width: 40px;
			width: 40px;
			border-radius: 100px;
			overflow: hidden;
		}
	}
</style>
