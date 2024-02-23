<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let twitchSession: string | undefined = $page.data.twitchSession;

	onMount(() => {
		if (twitchSession) {
			const validationInterval = 1000 * 60 * 60;
			let validationIntervalId: number;

			validationIntervalId = setInterval(async () => {
				await fetch('/api/twitch/validate');
			}, validationInterval);

			return () => clearInterval(validationIntervalId);
		}
	});
</script>

<slot />
