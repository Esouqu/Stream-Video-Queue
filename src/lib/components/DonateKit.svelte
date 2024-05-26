<script lang="ts">
	import queue from '$lib/stores/queue';
	import { getRandomInRange } from '$lib/utils';
	import Button from './Button.svelte';

	function addVideo() {
		queue.add({
			videoId: 'ovU-lOSLHmk',
			isPaid: true,
			message: 'test',
			username: 'zxc',
			price: getRandomInRange(100, 1000)
		});
	}
</script>

<div>
	<Button title="Donate" on:click={() => addVideo()} />
	<Button
		title="Donate Multiple"
		on:click={() => {
			let count = 1;
			const intervalId = setInterval(() => {
				count++;
				if (count > 5) clearInterval(intervalId);

				addVideo();
			}, 50);
		}}
	/>
</div>

<style lang="scss">
</style>
