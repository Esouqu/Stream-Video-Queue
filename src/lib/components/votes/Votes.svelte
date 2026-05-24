<script lang="ts">
	import { onMount } from 'svelte';
	import G from '$lib/stores/G.svelte';
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
		NumberFormatter.formatTimerValue(G.poll.votesBlockTimer.current, {
			startMs: G.poll.votesBlockTimer.startTime
		})
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
			// const message = G.poll.skipKeyword;
			const message = randInt(0, 2) === 0 ? G.poll.keepKeyword : G.poll.skipKeyword;
			const name = crypto.randomUUID() as string;
			G.onSocketMessage({ name, message, value: 0, source: 'twitch' });
		}, 250);
	}
</script>

<div class={cn('relative flex shrink-0 flex-col gap-2', className)}>
	<div class="flex w-full justify-between text-sm font-semibold text-muted-foreground tabular-nums">
		<div>Голосование ({G.poll.difference} из {G.poll.neededVotes})</div>
		<Button
			variant="ghost"
			class="h-5 p-0"
			disabled={!G.poll.isEnoughVotes}
			onclick={() => G.resetVotes(true)}
		>
			<RefreshCwIcon class="size-4" />
			Сбросить
		</Button>
	</div>
	<div class="flex w-full flex-col gap-1.5">
		<VotesProgress
			title={G.poll.keepKeyword}
			Icon={ThumbUpIcon}
			value={G.poll.keepVotes}
			total={G.poll.votes}
		/>
		<VotesProgress
			title={G.poll.skipKeyword}
			Icon={ThumbDownIcon}
			value={G.poll.skipVotes}
			total={G.poll.votes}
			isHighlighted={G.poll.isEnoughVotes}
		/>
	</div>

	{#if G.poll.votesBlockTimer.isRunning || !G.canVote}
		<div
			class="absolute top-1/2 left-1/2 z-50 flex size-full -translate-1/2 items-center justify-center rounded-md bg-black/50 backdrop-blur-md select-none"
			transition:fade
		>
			<div class="flex flex-col text-center font-semibold">
				{#if G.poll.votesBlockTimer.isRunning}
					<span class="text-muted-foreground">Голосование начнется через</span>
					<span class="tabular-nums">{formattedTime}</span>
				{:else}
					<span class="text-muted-foreground">Ждем видео...</span>
				{/if}
			</div>
		</div>
	{/if}
</div>
