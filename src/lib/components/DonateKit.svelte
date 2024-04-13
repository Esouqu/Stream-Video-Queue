<script lang="ts">
	import queue from '$lib/stores/queue';
	import Button from './Button.svelte';
</script>

<div>
	<Button title="Donate" on:click={() => queue.add({ videoId: 'ovU-lOSLHmk' }, 'Anon', true)} />
	<Button
		title="Donate Multiple"
		on:click={() => {
			let count = 1;
			const intervalId = setInterval(() => {
				count++;
				if (count > 5) clearInterval(intervalId);

				queue.add({ videoId: 'ovU-lOSLHmk' }, 'Anon', true);
			}, 50);
		}}
	/>
</div>

<style lang="scss">
</style>
