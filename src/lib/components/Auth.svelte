<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from './Button.svelte';

	export let icon: string;
	export let title: string;
	export let url: string;
	export let isLoggedIn: boolean;
	export let onLogout: (() => void) | null;
	export let userName = '';

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
		<div class="icon-wrapper" style="width: 30px; height: 30px;">
			<img src={icon} alt="{title} Brand Icon" />
		</div>
		<div>
			<h3 style="margin: 0;">{title}</h3>
			{#if isLoggedIn}
				<p style="margin: 0; font-size: 0.9rem;">Пользователь: {userName}</p>
			{/if}
		</div>
	</div>
	<Button on:click={handleClick} title={isLoggedIn ? 'Выйти' : 'Подключить'} />
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
	}
</style>
