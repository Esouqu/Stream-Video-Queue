<script lang="ts">
	import Input from './Input.svelte';
	import likeIcon from '$lib/assets/thumb_up_icon.svg';
	import dislikeIcon from '$lib/assets/thumb_down_icon.svg';
	import NumberInput from './NumberInput.svelte';
	import votes from '$lib/stores/votes';
	import settings from '$lib/stores/settings';
	import AnimatedCounter from './AnimatedCounter.svelte';
	import { onMount } from 'svelte';

	export let isDisabled = false;
	let options: HTMLInputElement[] = [];
	let neededValue: number;

	$: twitchSettings = settings.twitch;
	$: votesDifference = votes.difference;

	onMount(() => (neededValue = $twitchSettings.votes.needed));

	function handleVotes() {
		settings.setTwitchVotes(neededValue);
	}

	function focusOn(idx: number) {
		options[idx]?.focus();
	}
</script>

<div class="votes" class:disabled={isDisabled}>
	<div style="display: flex; align-items: center;">
		<button type="button" class="votes-section clickable" on:click={() => focusOn(0)}>
			<div class="votes-icon-wrapper">
				<img src={likeIcon} alt="Vote Button Icon" />
			</div>
			<div style="margin-right: 6px;">
				<AnimatedCounter value={$votes.keep} />
			</div>
			<Input
				id="vote-button-{0}"
				type="text"
				placeholder="Слово"
				bind:element={options[0]}
				bind:value={$twitchSettings.votes.keepKeyword}
			/>
		</button>

		<div class="votes-divider" />

		<button type="button" class="votes-section clickable" on:click={() => focusOn(2)}>
			<div class="votes-icon-wrapper">
				<img src={dislikeIcon} alt="Vote Button Icon" />
			</div>
			<div style="margin-right: 6px;">
				<AnimatedCounter value={$votes.skip} />
			</div>
			<Input
				id="vote-button-{2}"
				type="text"
				placeholder="Слово"
				bind:element={options[2]}
				bind:value={$twitchSettings.votes.skipKeyword}
			/>
		</button>

		<div class="votes-divider" />

		<button type="button" class="votes-section" on:click={() => focusOn(1)}>
			<div style="display: flex; gap: 5px;">
				<span>Набранно</span>
				<AnimatedCounter value={$votesDifference} />
				<span>/</span>
			</div>
			<NumberInput
				id="split-button-{1}"
				onBlur={handleVotes}
				onEnter={handleVotes}
				bind:element={options[1]}
				bind:value={neededValue}
			/>
		</button>
	</div>
</div>

<style lang="scss">
	.votes {
		position: relative;
		display: flex;
		border-radius: 100px;
		background-color: var(--surface-container-high);

		&.disabled {
			opacity: 0.5;
		}

		&-icon-wrapper {
			display: flex;
			margin-right: 6px;
			width: 24px;
		}

		&-divider {
			width: 1px;
			height: 70%;
			background-color: var(--neutral);
		}

		&-section {
			position: relative;
			display: flex;
			justify-content: center;
			align-items: center;
			gap: 5px;
			padding: 7px 20px;
			border: 0;
			height: 100%;
			color: var(--on-surface);
			background-color: transparent;
			transition: 0.2s;
			cursor: pointer;

			&:nth-of-type(1) {
				border-radius: 100px 0 0 100px;
			}
			&:nth-of-type(3) {
				border-radius: 0 100px 100px 0;
			}

			&:hover {
				background-color: var(--hover-white);
			}
		}
	}
</style>
