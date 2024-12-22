<script lang="ts">
	import '../app.css';
	import appManager from '$lib/scripts/AppManager.svelte';
	import { page } from '$app/stores';
	import { onMount, type Snippet } from 'svelte';
	import VideoPlayer from '$lib/components/VideoPlayer.svelte';
	import { TooltipProvider } from '$lib/components/ui/tooltip';
	import Votes from '$lib/components/Votes.svelte';
	import twitchApi from '$lib/api/twitchApi';
	import { updateLocalStorageVersion } from '$lib/utils';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let twitchUser = $page.data.twitchUserData;
	let donationalertsUser = $page.data.donationAlertsUserData;

	onMount(() => {
		updateLocalStorageVersion(1);

		if (twitchUser) {
			twitchApi.validateTokenEveryHour();
			appManager.twitchChatSocket.connect(twitchUser.login);
		}

		if (donationalertsUser) {
			appManager.centrifugoSocket.connect(donationalertsUser);
		}
	});
</script>

<TooltipProvider delayDuration={0}>
	<div class="relative grid h-full w-full grid-cols-[auto_25.6rem]">
		<div class="m-4 flex flex-col justify-center gap-4">
			<VideoPlayer />
			{#if appManager.poll.isEnabled}
				<div class="relative flex w-full flex-1 items-center justify-center">
					<Votes />
				</div>
			{/if}
		</div>

		{@render children()}
	</div>
</TooltipProvider>
