<script lang="ts">
	import { onMount } from 'svelte';
	import appStore from '$lib/stores/AppStore.svelte';
	import ThumbUpIcon from '../icons/ThumbUpIcon.svelte';
	import ThumbDownIcon from '../icons/ThumbDownIcon.svelte';
	import { randInt } from '$lib/utils';
	import VotesProgress from './components/VotesProgress.svelte';

	let intervalId: number;

	onMount(() => {
		autoVote();

		return () => clearInterval(intervalId);
	});

	function autoVote() {
		intervalId = window.setInterval(() => {
			// const vote = appStore.poll.skipKeyword;
			const vote = randInt(0, 2) === 0 ? appStore.poll.keepKeyword : appStore.poll.skipKeyword;
			const username = crypto.randomUUID() as string;
			appStore.poll.addVote(username, vote);
		}, 500);
	}
</script>

<div
	class="pointer-events-auto relative flex w-full shrink-0 flex-col justify-between gap-2 overflow-hidden rounded-md border bg-neutral-700/30 p-2 shadow-md backdrop-blur-md transition-colors duration-700"
>
	<div
		class="flex w-full justify-between px-1 text-sm font-semibold text-muted-foreground tabular-nums"
	>
		<div>Голосование (Разница)</div>
		<div>
			{appStore.poll.difference} из {appStore.poll.neededVotes} до пропуска
		</div>
	</div>
	<div class="flex w-full flex-col gap-1 text-center font-semibold text-neutral-200">
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

	<!-- <div class="flex gap-2">
		<Button variant="secondary" size="sm" class="flex-1">Приостановить</Button>
		<Button variant="secondary" size="sm" class="flex-1" onclick={() => appStore.resetVotes()}
			>Сбросить</Button
		>
	</div> -->
</div>
