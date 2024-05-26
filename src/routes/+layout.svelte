<script lang="ts">
	import { page } from '$app/stores';
	import centrifugo from '$lib/centrifugo';
	import chat from '$lib/chat';
	import initializeSubscriptions from '$lib/subscriptionBus';
	import twitchApi from '$lib/twitchApi';
	import { onMount } from 'svelte';

	let twitchChannel = $page.data.twitchChannel;
	let donationAlertsUser = $page.data.donationAlertsUser;

	onMount(() => {
		if (twitchChannel) {
			twitchApi.validateTokenWithInterval();
			chat.initialize(twitchChannel.login);
		}

		if (donationAlertsUser) {
			centrifugo.connect(donationAlertsUser);
		}

		initializeSubscriptions();
	});
</script>

<div class="layout-wrapper">
	<slot />
</div>

<style lang="scss">
	.layout-wrapper {
		position: relative;
		display: contents;
	}
</style>
