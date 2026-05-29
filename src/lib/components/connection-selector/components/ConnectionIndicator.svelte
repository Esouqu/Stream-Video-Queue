<script lang="ts">
	import type { SocketState } from '$lib/types';

	type Props = {
		state: SocketState;
		color?: string;
		withTitle?: boolean;
	};

	const statusToTitle = {
		'not-exists': 'Отключено',
		open: 'Подключено',
		closed: 'Отключено',
		connecting: 'Подключение...'
	};

	const { state, color, withTitle = false }: Props = $props();
</script>

<div class="flex items-center gap-1.5">
	<span class="relative flex size-2">
		{#if state === 'connecting'}
			<span
				class="absolute inline-flex h-full w-full animate-ping rounded-full bg-muted-foreground opacity-75"
			></span>
		{/if}
		<span
			class="relative inline-flex size-2 rounded-full bg-muted-foreground data-[state=open]:bg-(--indicator-color)"
			style="--indicator-color: {color};"
			data-state={state}
		></span>
	</span>
	{#if withTitle}
		<span class="text-xs text-muted-foreground capitalize">{statusToTitle[state]}</span>
	{/if}
</div>
