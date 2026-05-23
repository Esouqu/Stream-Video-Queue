<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from 'svelte-sonner';
	import { TooltipProvider } from '$lib/components/ui/tooltip';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>StreamQueue</title>
</svelte:head>

<Toaster richColors closeButton />
<TooltipProvider disableHoverableContent ignoreNonKeyboardFocus delayDuration={500}>
	{@render children()}
</TooltipProvider>
