<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	const twitchChannel = $page.data.twitchChannel;

	onMount(() => {
		if (twitchChannel) {
			const validationInterval = 1000 * 60 * 60;

			setInterval(async () => {
				const response = await fetch('/api/twitch/validate').then((res) => res);

				if (response.status === 401 || response.status === 400) {
					location.reload();
				}
			}, validationInterval);
		}
	});
</script>

<slot />
