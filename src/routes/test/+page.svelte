<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import G from '$lib/stores/G.svelte';
	import type { SocketMessageData } from '$lib/types';
	import { toast } from 'svelte-sonner';

	let messages = $state<SocketMessageData[]>([]);
	let connectionCounter = $state(0);

	let messageIntervalId: number;
	let connectionIntervalId: number;

	function disconnect() {
		clearInterval(messageIntervalId);
	}

	async function getMessages() {
		const _messages = await G.turnirApi.getMessages({
			channel: 'deshaefrost',
			platform: 'kick'
		});

		if (_messages) {
			console.log(_messages);
			const mapped: SocketMessageData[] = _messages.chat_messages.map((data) => ({
				name: data.user.username,
				message: data.message,
				value: 0,
				source: 'kick'
			}));

			messages.push(...mapped);
		}
	}

	async function initConnection() {
		const data = await G.turnirApi.checkConnectionStatus({
			channel: 'deshaefrost',
			platform: 'kick'
		});

		toast.info('Connection status: ' + data?.stream_status);
		console.log(data);

		if (!data) return;

		if (data.stream_status === 'connected') {
			clearInterval(connectionIntervalId);
			messageIntervalId = window.setInterval(async () => {
				await getMessages();
			}, 3000);

			return;
		}

		if (data.stream_status === 'disconnected') {
			connectionIntervalId = window.setInterval(async () => {
				if (connectionCounter > 3) return;
				await initConnection();
				connectionCounter++;
			}, 1000);
		}
	}
</script>

<div class="flex h-dvh items-center justify-center">
	<div class="flex w-100 flex-col gap-4">
		<Button onclick={initConnection}>Connect</Button>
		<Button onclick={disconnect}>Disconnect</Button>
	</div>
</div>
