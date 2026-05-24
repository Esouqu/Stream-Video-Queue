<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { cn } from '$lib/utils';
	type Props = {
		class?: string;
	};

	const { class: className }: Props = $props();
</script>

<div class={cn('relative flex w-full gap-2 p-2 py-0 select-none', className)}>
	<div class="relative">
		<Skeleton class="aspect-video h-auto w-38.5 animate-none rounded-sm" />
	</div>
	<div class="flex w-full flex-col gap-2">
		<Skeleton class="h-4 w-full animate-none" />
		<Skeleton class="h-4 w-full animate-none" />
		<Skeleton class="h-3 w-full animate-none" />
		<Skeleton class="h-3 w-full animate-none" />
	</div>
</div>
