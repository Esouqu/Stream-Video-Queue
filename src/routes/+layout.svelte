<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	const twitchChannel = $page.data.twitchChannel;

	$: console.log($page.data.session, $page.data.refreshSession);

	onMount(() => {
		if (!twitchChannel) return;

		const validationInterval = 1000 * 60 * 60;

		setInterval(async () => {
			const response = await fetch('/api/twitch/validate').then((res) => res);

			if (response.status === 401 || response.status === 400) {
				const refreshResponse = await fetch('/api/twitch/refresh', {
					method: 'POST'
				}).then((res) => res);

				if (refreshResponse.status !== 200) location.reload();
			}
		}, validationInterval);
	});
</script>

<slot />
