<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	const twitchChannel = $page.data.twitchChannel;

	onMount(() => {
		if (twitchChannel) {
			const validationInterval = 1000 * 60 * 60;

			fetch('/api/twitch/validate');

			setInterval(async () => {
				fetch('/api/twitch/validate');
			}, validationInterval);
		}
	});
</script>

<slot />
