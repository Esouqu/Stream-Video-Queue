<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import TimerStore from '$lib/stores/TimerStore.svelte';
	import NumberFormatter from '$lib/utils/NumberFormatter';

	const timerUp = new TimerStore('up');
	const timerDown = new TimerStore();
</script>

<div class="flex h-dvh items-center justify-center gap-4">
	<div class="bg-rose-500/10">
		<div>{timerDown.state}</div>
		<div>{NumberFormatter.formatTimerValue(timerDown.current, timerDown.startTime)}</div>
		<div class="text-muted-foreground">{NumberFormatter.formatTimerValue(timerDown.startTime)}</div>
		<Button onclick={() => timerDown.reset()}>reset</Button>
		<Button onclick={() => timerDown.stop()}>stop</Button>
		<Button onclick={() => timerDown.pause()}>pause</Button>
		<Button onclick={() => timerDown.start()}>start</Button>
		<Button onclick={() => timerDown.add()}>+</Button>
		<Button onclick={() => timerDown.subtract()}>-</Button>
	</div>
	<div class="bg-emerald-500/10">
		<div>{timerUp.state}</div>
		<div>{NumberFormatter.formatTimerValue(timerUp.current, timerUp.startTime)}</div>
		<div class="text-muted-foreground">{NumberFormatter.formatTimerValue(timerUp.startTime)}</div>
		<Button onclick={() => timerUp.reset()}>reset</Button>
		<Button onclick={() => timerUp.stop()}>stop</Button>
		<Button onclick={() => timerUp.pause()}>pause</Button>
		<Button onclick={() => timerUp.start()}>start</Button>
		<Button onclick={() => timerUp.add()}>+</Button>
		<Button onclick={() => timerUp.subtract()}>-</Button>
	</div>
</div>
