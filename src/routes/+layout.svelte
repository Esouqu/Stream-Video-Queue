<script lang="ts">
	import '../app.css';
	import appManager from '$lib/scripts/AppManager.svelte';
	import { page } from '$app/state';
	import { onMount, type Snippet } from 'svelte';
	import VideoPlayer from '$lib/components/VideoPlayer.svelte';
	import { TooltipProvider } from '$lib/components/ui/tooltip';
	import twitchApi from '$lib/api/twitchApi';
	import { updateLocalStorageVersion } from '$lib/utils';
	import Votes from '$lib/components/Votes.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let twitchUser = page.data.twitchUserData;
	let donationalertsUser = page.data.donationAlertsUserData;

	onMount(() => {
		updateLocalStorageVersion(1);

		if (twitchUser?.id) {
			twitchApi.validateTokenEveryHour();
			appManager.twitchChatSocket.connect(twitchUser.login);
		}

		if (donationalertsUser?.id) {
			appManager.centrifugoSocket.connect(donationalertsUser);
		}
	});
</script>

<TooltipProvider delayDuration={0}>
	<div class="relative grid h-full w-full grid-cols-[auto_25.6rem]">
		<div class="m-4 flex max-h-[calc(100vh-2rem)] flex-col justify-center">
			<VideoPlayer />
			{#if appManager.poll.isEnabled}
				<div class="flex h-[3.5rem] w-full items-center justify-center">
					<Votes />
				</div>
			{/if}
		</div>

		{@render children()}
	</div>
</TooltipProvider>
