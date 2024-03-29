<script lang="ts">
	import Switch from '$lib/components/Switch.svelte';

	export let title: string;
	export let description: string;
	export let isToggled = false;
	export let isDisabled = false;
	export let isLoading = false;
	export let on: () => void;
	export let off: () => void;
</script>

<div class="switch-setting">
	<div style="display: flex; flex-direction: column; width: 100%;">
		<div style="display: flex; align-items: center; gap: 15px;">
			<span style="font-weight: 500;">{title}</span>
		</div>
		<span style="font-size: .9rem; font-weight: 300; white-space: break-spaces;">{description}</span
		>
	</div>
	<Switch {on} {off} bind:isToggled bind:isDisabled bind:isLoading />
</div>

<style lang="scss">
	.switch-setting {
		display: grid;
    grid-template-columns: auto 90px;
		align-items: center;
    justify-items: end;
		gap: 20px;
		color: var(--on-surface);
	}
</style>
