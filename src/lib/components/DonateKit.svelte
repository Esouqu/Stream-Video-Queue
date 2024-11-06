<script lang="ts">
	import centrifugo from '$lib/stores/centrifugo';
	import { getRandomInRange } from '$lib/utils';
	import { v4 as uuid } from 'uuid';
	import Button from './Button.svelte';
	import Snackbar from './Snackbar.svelte';
	import NumberInput from './NumberInput.svelte';
	import Input from './Input.svelte';
	import toolsIcon from '$lib/assets/tools_icon.svg';

	let isShown = false;
	let amount: number = getRandomInRange(100, 1000);
	let message: string;

	function addVideo() {
		centrifugo.processDonation({
			id: uuid(),
			name: 'tester',
			username: 'tester',
			amount,
			amount_in_user_currency: amount,
			currency: 'RUB',
			message,
			created_at: Date.now().toString(),
			message_type: 'donation',
			paying_system: 'manual',
			is_shown: true,
			recipient_name: 'tester',
			recipient: 'tester',
			shown_at: Date.now().toString(),
			reason: 'donation'
		});
	}

	function onClick() {
		const maxCount = 5;
		let count = 0;

		const intervalId = setInterval(() => {
			if (count >= maxCount) clearInterval(intervalId);

			addVideo();
			count++;
		}, 50);
	}
</script>

<div style="position: relative;">
	<Button icon={toolsIcon} on:click={() => (isShown = !isShown)} />
	{#if isShown}
		<div class="donate-kit-popup">
			<Snackbar>
				<NumberInput
					--input-p="10.5px"
					--input-w-w="90px"
					--input-w="100%"
					--input-text-al="start"
					id="donate-kit-amount"
					isFilled={false}
					isBorderless={false}
					bind:value={amount}
				/>
				<Input
					--input-p="10.5px"
					--input-w="200px"
					--input-text-al="start"
					id="donate-kit-message"
					type="text"
					isFilled={false}
					isBorderless={false}
					bind:value={message}
				/>
				<Button title="Donate" on:click={addVideo} />
				<Button title="Donate Multiple" on:click={onClick} />
			</Snackbar>
		</div>
	{/if}
</div>

<style lang="scss">
	.donate-kit {
		&-popup {
			position: absolute;
			bottom: 130%;
			right: 100%;
			z-index: 999;
		}
	}
</style>
