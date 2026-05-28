<script lang="ts">
	import G from '$lib/stores/G.svelte';
	import ThumbUpIcon from '../icons/ThumbUpIcon.svelte';
	import ThumbDownIcon from '../icons/ThumbDownIcon.svelte';
	import { cn } from '$lib/utils';
	import VotesProgress from './components/VotesProgress.svelte';
	import { Button } from '../ui/button';
	import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
	import { fade } from 'svelte/transition';
	import NumberFormatter from '$lib/utils/NumberFormatter';

	type Props = {
		class?: string;
	};

	const { class: className }: Props = $props();

	const formattedTime = $derived(
		NumberFormatter.formatMs(G.poll.blockTimer.current, {
			startMs: G.poll.blockTimer.startTime
		})
	);

	function resetVotes() {
		G.poll.reset(true);
		G.autoSkipTimer.reset();
	}
</script>

<div class={cn('relative flex shrink-0 flex-col gap-2 p-2', className)}>
	<div class="flex w-full justify-between text-sm font-semibold text-muted-foreground tabular-nums">
		<div>Голосование ({G.poll.difference} из {G.settings.neededVotes})</div>
		<Button variant="ghost" class="h-5 p-0" disabled={!G.poll.isEnoughVotes} onclick={resetVotes}>
			<RefreshCwIcon class="size-4" />
			Сбросить
		</Button>
	</div>
	<div class="flex w-full flex-col gap-1.5">
		<VotesProgress
			title={G.settings.keepKeyword}
			Icon={ThumbUpIcon}
			value={G.poll.keepVotes}
			total={G.poll.votes}
		/>
		<VotesProgress
			title={G.settings.skipKeyword}
			Icon={ThumbDownIcon}
			value={G.poll.skipVotes}
			total={G.poll.votes}
			isHighlighted={G.poll.isEnoughVotes}
		/>
	</div>

	{#if G.poll.blockTimer.isRunning || !G.settings.isPollEnabled || !G.queueManager.current}
		<div
			class="absolute top-1/2 left-1/2 z-50 flex size-full -translate-1/2 items-center justify-center rounded-md bg-muted select-none"
			transition:fade
		>
			<div class="flex flex-col text-center font-semibold">
				{#if G.poll.blockTimer.isRunning}
					<span class="text-muted-foreground">Голосование начнется через</span>
					<span class="tabular-nums">{formattedTime}</span>
				{:else}
					<span class="text-muted-foreground">Ждем видео...</span>
				{/if}
			</div>
		</div>
	{/if}
</div>
