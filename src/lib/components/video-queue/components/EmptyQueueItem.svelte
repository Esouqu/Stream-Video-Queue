<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';
</script>

<div class="relative flex w-full gap-2 p-2 py-0 select-none">
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
