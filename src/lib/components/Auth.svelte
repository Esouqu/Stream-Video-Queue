<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from './Button.svelte';

	export let icon: string;
	export let title: string;
	export let url: string;
	export let isLoggedIn: boolean;
	export let onLogout: (() => void) | null;

	function handleClick() {
		if (!isLoggedIn) {
			goto(url);
		} else if (onLogout) {
			onLogout();
		}
	}
</script>

<div class="auth">
	<div class="auth-title-wrapper">
		<div class="auth-icon-wrapper">
			<img src={icon} alt="{title} Brand Icon" />
		</div>
		<h3 style="margin: 0;">{title}</h3>
	</div>
	<Button on:click={handleClick} title={isLoggedIn ? 'Выйти' : 'Авторизоваться'} />
</div>

<style lang="scss">
	.auth {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 15px 0;

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
