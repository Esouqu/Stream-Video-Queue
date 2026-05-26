<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title: string;
		children: Snippet;
	};

	const { title, children }: Props = $props();
</script>

<div class="space-y-4 [&+*]:mt-4 [&+*]:border-t [&+*]:pt-4" data-slot="setting-group">
	<h3 class="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
		{title}
	</h3>

	{@render children()}
</div>
