<script lang="ts">
	import Input from './Input.svelte';
	import likeIcon from '$lib/assets/thumb_up_icon.svg';
	import dislikeIcon from '$lib/assets/thumb_down_icon.svg';
	import NumberInput from './NumberInput.svelte';
	import votes from '$lib/stores/votes';
	import settings from '$lib/stores/settings';
	import chat from '$lib/chat';
	import AutoIndicator from './AutoIndicator.svelte';

	let options: HTMLInputElement[] = [];

	$: isAutodetection = settings.isAutodetection;
	$: percentFromViewCount = settings.percentFromViewCount;
	$: viewCount = chat.viewCount;
	$: keywords = settings.userInput;
	$: votesDifference = votes.difference;
	$: {
		if ($isAutodetection && $viewCount > 0) {
			const percent = $percentFromViewCount / 100;

			settings.setNeededVotes(Math.floor($viewCount * percent));
		}
	}

	function focusOn(idx: number) {
		options[idx]?.focus();
		options[idx]?.select();
	}
</script>

<div class="votes">
	<div style="display: flex; align-items: center;">
		<button type="button" class="votes-section clickable" on:click={() => focusOn(0)}>
			<div class="votes-icon-wrapper">
				<img src={likeIcon} alt="Vote Button Icon" />
			</div>
			<Input
				id="vote-button-{0}"
				type="text"
				placeholder="Слово"
				bind:element={options[0]}
				bind:value={$keywords.keepKeyword}
			/>
			<span>{$votes.keep}</span>
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
			<span>Набранно {$votesDifference} /</span>
			{#if $isAutodetection}
				<span>{$keywords.needed}</span>
			{:else}
				<NumberInput
					id="split-button-{1}"
					isFilled={false}
					bind:element={options[1]}
					bind:value={$keywords.needed}
				/>
			{/if}
		</button>

		<div class="votes-divider" />

		<button type="button" class="votes-section clickable" on:click={() => focusOn(2)}>
			<div class="votes-icon-wrapper">
				<img src={dislikeIcon} alt="Vote Button Icon" />
			</div>
			<Input
				id="vote-button-{2}"
				type="text"
				placeholder="Слово"
				bind:element={options[2]}
				bind:value={$keywords.skipKeyword}
			/>
			<span>{$votes.skip}</span>
		</button>
	</div>
</div>

<style lang="scss">
	.votes {
		position: relative;
		display: flex;
		border-radius: 100px;
		background-color: var(--surface-bright);

		&-icon-wrapper {
			display: flex;
			margin-right: 5px;
			width: 25px;
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
