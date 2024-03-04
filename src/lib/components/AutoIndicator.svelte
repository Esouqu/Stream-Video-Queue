<script>
	import { fly } from 'svelte/transition';
</script>

<div class="auto-indicator" transition:fly={{ y: 10, duration: 200 }}>Авто</div>

<style lang="scss">
	.auto-indicator {
		position: absolute;
		top: -10px;
		left: 50%;
		z-index: 999;
		translate: -50% 0;
		padding: 0px 5px;
		border-radius: 5px;
		font-size: 0.9rem;
		color: var(--on-surface);
		background-color: var(--primary-50);
	}
</style>
