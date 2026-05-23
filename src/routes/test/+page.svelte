<script lang="ts">
	import IntegrationSelector from '$lib/components/IntegrationSelector.svelte';
	import IntegrationsSection from '$lib/components/settings/components/IntegrationsSection.svelte';
</script>

<div class="flex h-dvh items-center justify-center">
	<div class="flex w-100 flex-col gap-4">
		<IntegrationsSection />
		<IntegrationSelector />
	</div>
</div>
