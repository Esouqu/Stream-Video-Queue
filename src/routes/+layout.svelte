<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let twitchSession: string | undefined = $page.data.twitchSession;
	// let isConnectingToTwitch = false;
	// let isTwitchToggled = false;
	// let twitchWebSocket: WebSocket;

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

	// async function connectToTwitchSocket() {
	// 	const pingIntervalInMin = 1000 * 60;
	// 	const reconnectInterval = 1000 * 3;
	// 	const twitchChannel = await fetch('/api/twitch/user')
	// 		.then((res) => res.json())
	// 		.then((data) => data);

	// 	let heartbeatInterval: number;

	// 	twitchWebSocket = new WebSocket('wss://pubsub-edge.twitch.tv');

	// 	function heartbeat() {
	// 		twitchWebSocket.send(
	// 			JSON.stringify({
	// 				type: 'PING'
	// 			})
	// 		);
	// 	}

	// 	twitchWebSocket.addEventListener('open', async () => {
	// 		twitchWebSocket.send(
	// 			JSON.stringify({
	// 				type: 'LISTEN',
	// 				data: {
	// 					topics: [`channel-points-channel-v1.${twitchChannel}`],
	// 					auth_token: twitchSession
	// 				}
	// 			})
	// 		);

	// 		heartbeat();
	// 		heartbeatInterval = setInterval(() => {
	// 			heartbeat();
	// 		}, pingIntervalInMin);
	// 	});
	// 	twitchWebSocket.addEventListener('message', (event) => {
	// 		const message = JSON.parse(event.data);

	// 		if (message.type === 'RECONNECT') {
	// 			setTimeout(connectToTwitchSocket, reconnectInterval);
	// 		}

	// 		if (message.type === 'RESPONSE') {
	// 			isConnectingToTwitch = false;

	// 			if (message.error === 'ERR_BADMESSAGE') {
	// 				isTwitchToggled = false;
	// 			}
	// 		}

	// 		if (message.type === 'MESSAGE') {

	// 		}
	// 	});
	// 	twitchWebSocket.addEventListener('close', () => {
	// 		clearInterval(heartbeatInterval);
	// 	});
	// 	twitchWebSocket.addEventListener('error', (event) => {
	// 		console.error('WebSocket error:', event);
	// 	});
	// }
</script>

<slot />
