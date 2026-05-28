<script lang="ts">
	import Range from '$lib/components/Range.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import NumberFormatter from '$lib/utils/NumberFormatter';
	import { fade } from 'svelte/transition';

	type Props = {
		current: number;
		duration: number;
		paidDuration: number;
		start: number;
		isLive: boolean;
	};

	const { current, duration, paidDuration, start, isLive }: Props = $props();

	const currentString = $derived(
		NumberFormatter.formatMs(current, {
			startMs: duration
		})
	);
	const durationString = $derived(NumberFormatter.formatMs(duration));
</script>

<div
	class="pointer-events-none relative flex size-full items-end"
	transition:fade={{ duration: 250 }}
>
	<Progress
		class="absolute inset-0 -z-1 size-full rounded-none bg-transparent *:data-[slot=progress-indicator]:bg-white/10 *:data-[slot=progress-indicator]:duration-250"
		value={current}
		max={duration}
	/>
	<div class="w-full opacity-0 transition-opacity group-hover:opacity-100">
		{#if isLive}
			<div class="w-full">
				<Badge class="mb-2 ml-2 px-1 py-0" variant="destructive">LIVE</Badge>
				<div class="h-1 w-full bg-red-500"></div>
			</div>
		{:else}
			<div class="mb-1 flex justify-between px-2 text-sm font-semibold text-muted-foreground">
				<div>{currentString}</div>
				<div>{durationString}</div>
			</div>
			<Progress
				class="h-1 w-full rounded-none bg-white/10 *:data-[slot=progress-indicator]:bg-white/20 *:data-[slot=progress-indicator]:duration-250"
				value={current}
				max={duration}
			/>
			<Range
				class="pointer-events-none absolute bottom-0 h-1 w-full **:data-[slot=progress-indicator]:bg-red-500"
				{start}
				end={start + paidDuration}
				min={0}
				max={duration}
			/>
			<!-- <Slider
				noThumbs
				type="multiple"
				class="pointer-events-none absolute bottom-0 w-full **:data-[slot=slider-range]:bg-red-500 **:data-[slot=slider-track]:h-1 **:data-[slot=slider-track]:bg-transparent"
				value={[start, paidDuration]}
				max={duration * 1000}
			/> -->
		{/if}
	</div>
</div>
