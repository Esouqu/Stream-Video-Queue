<script lang="ts">
	import { onMount } from 'svelte';
	import appStore from '$lib/stores/AppStore.svelte';
	import ThumbUpIcon from '../icons/ThumbUpIcon.svelte';
	import ThumbDownIcon from '../icons/ThumbDownIcon.svelte';
	import { cn, randInt } from '$lib/utils';
	import VotesProgress from './components/VotesProgress.svelte';
	import { Button } from '../ui/button';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import { fade } from 'svelte/transition';
	import NumberFormatter from '$lib/utils/NumberFormatter';
	import { dev } from '$app/environment';

	type Props = {
		class?: string;
	};

	const { class: className }: Props = $props();

	const formattedTime = $derived(
		NumberFormatter.formatTimerValue(
			appStore.poll.votesBlockTimer.current,
			appStore.poll.votesBlockTimer.startTime
		)
	);

	let intervalId: number;

	onMount(() => {
		if (dev) {
			autoVote();
		}
	});

	function autoVote() {
		clearInterval(intervalId);

		intervalId = window.setInterval(() => {
			// const message = appStore.poll.skipKeyword;
			const message = randInt(0, 2) === 0 ? appStore.poll.keepKeyword : appStore.poll.skipKeyword;
			const name = crypto.randomUUID() as string;
			appStore.onSocketMessage({ name, message, value: 0, source: 'twitch' });
		}, 250);
	}
</script>

<div class={cn('relative flex shrink-0 flex-col gap-2', className)}>
	<div class="flex w-full justify-between text-sm font-semibold text-muted-foreground tabular-nums">
		<div>Голосование ({appStore.poll.difference} из {appStore.poll.neededVotes})</div>
		<Button
			variant="ghost"
			class="h-5 p-0"
			disabled={!appStore.poll.isEnoughVotes}
			onclick={() => appStore.resetVotes(true)}
		>
			<RefreshCwIcon class="size-4" />
			Сбросить
		</Button>
	</div>
	<div class="flex w-full flex-col gap-1.5">
		<VotesProgress
			title={appStore.poll.keepKeyword}
			Icon={ThumbUpIcon}
			value={appStore.poll.keepVotes}
			total={appStore.poll.votes}
		/>
		<VotesProgress
			title={appStore.poll.skipKeyword}
			Icon={ThumbDownIcon}
			value={appStore.poll.skipVotes}
			total={appStore.poll.votes}
			isHighlighted={appStore.poll.isEnoughVotes}
		/>
	</div>

	{#if appStore.poll.votesBlockTimer.isRunning || !appStore.canVote}
		<div
			class="absolute top-1/2 left-1/2 z-50 flex size-full -translate-1/2 items-center justify-center rounded-md bg-black/50 backdrop-blur-md select-none"
			transition:fade
		>
			<div class="text-center font-semibold">
				{#if appStore.poll.votesBlockTimer.isRunning}
					<span class="text-muted-foreground">Голосование начнется через</span>
					<span class="tabular-nums">{formattedTime}</span>
				{:else}
					<span class="text-muted-foreground">Ждем видео...</span>
				{/if}
			</div>
		</div>
	{/if}
</div>
