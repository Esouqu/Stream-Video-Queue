<script lang="ts">
	import AnimatedCounter from './AnimatedCounter.svelte';
	import ThumbsUp from 'lucide-svelte/icons/thumbs-up';
	import ThumbsDown from 'lucide-svelte/icons/thumbs-down';
	import { Progress } from './ui/progress';
	import appManager from '$lib/scripts/AppManager.svelte';
	import { fly } from 'svelte/transition';
</script>

<div
	class="relative flex w-[27rem] select-none flex-col items-center justify-center gap-1 rounded-lg bg-elevation-2 px-4 py-2"
	transition:fly={{ y: 100 }}
>
	<div class="flex w-full justify-between gap-4 text-sm font-medium">
		<div class="flex items-center gap-2">
			<ThumbsUp size="1.25rem" />
			<AnimatedCounter value={appManager.poll.keep} />
			<span>{appManager.poll.keepKeyword}</span>
		</div>
		<div class="absolute left-[50%] flex translate-x-[-50%] gap-2 font-medium">
			<div class="flex items-center gap-1">
				<AnimatedCounter value={appManager.poll.difference} />
				<span>/</span>
				<span>{appManager.poll.neededVotes}</span>
			</div>
		</div>
		<div class="flex items-center gap-2">
			<ThumbsDown size="1.25rem" />
			<AnimatedCounter value={appManager.poll.skip} />
			<span>{appManager.poll.skipKeyword}</span>
		</div>
	</div>
	<div
		class="relative w-full after:absolute after:left-[50%] after:top-0 after:h-full after:w-[0.125rem] after:translate-x-[-50%] after:bg-primary"
	>
		<Progress class="h-1 w-full" max={100} value={appManager.poll.currentPercent} />
	</div>
</div>
