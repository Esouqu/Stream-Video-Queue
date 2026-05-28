<script lang="ts">
	import { cn } from '$lib/utils';

	type Props = {
		class?: string;
		min?: number;
		max?: number;
		start?: number;
		end?: number;
	};

	let { class: className, min = 0, max = 100, start = 20, end = 80 }: Props = $props();

	// Safeguard values from overlapping or exceeding bounds
	let safeStart = $derived(Math.max(min, Math.min(start, end)));
	let safeEnd = $derived(Math.min(max, Math.max(start, end)));

	// Derived percentages for positioning the visual segment
	let left = $derived(((safeStart - min) / (max - min)) * 100);
	let width = $derived(((safeEnd - safeStart) / (max - min)) * 100);
</script>

<div class={cn('relative h-2 w-full overflow-hidden', className)}>
	<div
		data-slot="progress-indicator"
		class="absolute h-full bg-orange-500 transition-all duration-300"
		style="left: {left}%; width: {width}%;"
	></div>
</div>
