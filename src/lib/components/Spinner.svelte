<script lang="ts">
	interface Props {
		size?: number;
	}

	const { size = 24 } = $props();
</script>

<div class="flex w-full items-center justify-center">
	<div
		class="h-6 w-6 animate-spin rounded-full border-solid border-b-transparent border-l-transparent border-r-primary border-t-primary"
		style="border-width: {size / 10}px; width: {size}px; height: {size}px;"
	></div>
</div>
