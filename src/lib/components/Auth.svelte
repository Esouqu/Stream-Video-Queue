<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from './Button.svelte';

	export let icon: string;
	export let title: string;
	export let url: string;
</script>

<div class="auth">
	<div class="auth-title-wrapper">
		<div class="auth-icon-wrapper">
			<img src={icon} alt="{title} Brand Icon" />
		</div>
		<h3>{title}</h3>
	</div>
	<Button on:click={() => goto(url)} title="Авторизоваться" />
</div>

<style lang="scss">
	.auth {
		display: flex;
		align-items: center;
		justify-content: space-between;

		&-title-wrapper {
			display: flex;
			align-items: center;
			gap: 15px;
		}

		&-icon-wrapper {
			display: flex;
			align-items: center;
			width: 25px;
		}
	}
</style>
