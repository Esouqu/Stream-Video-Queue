<script>
	import { fly } from 'svelte/transition';
	import Badge from './ui/badge/badge.svelte';
</script>

<div class="auto-indicator" transition:fly={{ y: 10, duration: 200 }}>
	<Badge class="px-1 py-[0.125rem] leading-none">Авто</Badge>
</div>

<style lang="scss">
	.auto-indicator {
		position: absolute;
		top: -0.75rem;
		left: 50%;
		z-index: 3;
		translate: -50% 0;
	}
</style>
