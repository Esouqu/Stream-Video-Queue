<script lang="ts">
	import Switch from '$lib/components/Switch.svelte';

	export let icon: string = '';
	export let title: string;
	export let description: string;
	export let isToggled = false;
	export let isDisabled = false;
	export let isLoading = false;
	export let on: () => void;
	export let off: () => void;
</script>

<div class="switch-setting">
	{#if icon}
		<div class="switch-setting-image-wrapper">
			<img src={icon} alt="Twitch User" />
		</div>
	{/if}
	<div style="display: flex; flex-direction: column; width: 100%;">
		<span style="font-weight: 500; margin-bottom: 5px;">{title}</span>
		<span style="font-size: .9rem; font-weight: 300; white-space: break-spaces;">{description}</span
		>
	</div>
	<Switch {on} {off} bind:isToggled bind:isDisabled bind:isLoading />
</div>

<style lang="scss">
	.switch-setting {
		display: flex;
		align-items: center;
		gap: 15px;
		color: var(--on-surface);

		&-image-wrapper {
			display: flex;
			min-width: 40px;
			width: 40px;
			border-radius: 100px;
			overflow: hidden;
		}
	}
</style>
