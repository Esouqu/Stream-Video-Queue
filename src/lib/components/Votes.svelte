<script lang="ts">
	import Input from './Input.svelte';
	import likeIcon from '$lib/assets/thumb_up_icon.svg';
	import dislikeIcon from '$lib/assets/thumb_down_icon.svg';
	import NumberInput from './NumberInput.svelte';
	import votes from '$lib/stores/votes';
	import settings from '$lib/stores/settings';
	import chat from '$lib/chat';
	import AutoIndicator from './AutoIndicator.svelte';
	import AnimatedCounter from './AnimatedCounter.svelte';
	import { onMount } from 'svelte';

	let options: HTMLInputElement[] = [];
	let neededValue: number;

	$: isAutodetection = settings.isAutodetection;
	$: percentFromViewCount = settings.percentFromViewCount;
	$: viewCount = chat.viewCount;
	$: userInput = settings.userInput;
	$: votesDifference = votes.difference;
	$: {
		// sets needed amount of votes if auto detection is on and view count more than 0
		if ($isAutodetection && $viewCount > 0) {
			const percent = $percentFromViewCount / 100;
			const neededVotes = Math.max(1, Math.floor($viewCount * percent));

			settings.setNeededVotes(neededVotes);
		}
	}

	onMount(() => (neededValue = $userInput.needed));

	function handleVotes() {
		settings.setNeededVotes(neededValue);
	}

	function focusOn(idx: number) {
		options[idx]?.focus();
		options[idx]?.select();
	}
</script>

<!-- <button type="button" class="votes-section clickable" on:click={() => votes.addVote('Оставить')}>
	KEEP
</button>
<button type="button" class="votes-section clickable" on:click={() => votes.addVote('Пропустить')}>
	SKIP
</button> -->
<div class="votes">
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
				bind:value={$userInput.keepKeyword}
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
				bind:value={$userInput.skipKeyword}
			/>
		</button>

		<div class="votes-divider" />

		<button
			type="button"
			class="votes-section"
			class:clickable={!$isAutodetection}
			on:click={() => focusOn(1)}
		>
			{#if $isAutodetection}
				<AutoIndicator />
			{/if}
			<div style="display: flex; gap: 5px;">
				<span>Набранно</span>
				<AnimatedCounter value={$votesDifference} />
				<span>/</span>
			</div>
			{#if $isAutodetection}
				<span>{$userInput.needed}</span>
			{:else}
				<NumberInput
					id="split-button-{1}"
					onBlur={handleVotes}
					onEnter={handleVotes}
					bind:element={options[1]}
					bind:value={neededValue}
				/>
			{/if}
		</button>
	</div>
</div>

<style lang="scss">
	.votes {
		position: relative;
		display: flex;
		border-radius: 100px;
		background-color: var(--surface-container-high);

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

			&:not(.clickable) {
				pointer-events: none;
				cursor: default;
			}

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
