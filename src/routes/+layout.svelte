<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from 'svelte-sonner';
	import { TooltipProvider } from '$lib/components/ui/tooltip';
	import { onDestroy, onMount } from 'svelte';
	import G from '$lib/stores/G.svelte';

	let { children } = $props();

	onMount(() => {
		G.initialize();
	});

	onDestroy(() => {
		G.integrationManager.disconnectAll();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>StreamQueue</title>
</svelte:head>

<Toaster richColors closeButton />
<TooltipProvider disableHoverableContent ignoreNonKeyboardFocus delayDuration={500}>
	{@render children()}
</TooltipProvider>
