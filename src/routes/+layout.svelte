<script lang="ts">
	import { dev } from '$app/environment';
	import { page } from '$app/stores';
	import DonateKit from '$lib/components/DonateKit.svelte';
	import initializeSubscriptions from '$lib/subscriptionBus';
	import twitchApi from '$lib/twitchApi';
	import { onMount } from 'svelte';

	let twitchChannel = $page.data.twitchChannel;

	onMount(() => {
		if (twitchChannel) twitchApi.validateTokenWithInterval();

		initializeSubscriptions();
	});
</script>

<div class="layout-wrapper">
	<slot />
	{#if dev}
		<div style="position: absolute; right: 20px; bottom: 20px;">
			<DonateKit />
		</div>
	{/if}
</div>

<style lang="scss">
	.layout-wrapper {
		position: relative;
		display: contents;
	}
</style>
