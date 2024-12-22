<script lang="ts">
	import ExternalLinkIcon from 'lucide-svelte/icons/external-link';
	import { Button } from './ui/button';

	interface Props {
		class?: string;
	}

	const { class: className }: Props = $props();

	const contacts = [
		{ href: 'https://github.com/Esouqu/Stream-Video-Queue', title: 'GitHub' },
		{ href: 'https://t.me/esouqu', title: 'Telegram' },
		{ href: 'https://boosty.to/esouqu/donate', title: 'Поддержать' }
	];
</script>

<div class="flex {className}">
	{#each contacts as { href, title }}
		<Button {href} variant="link" class="h-auto justify-between px-3 py-1.5" target="_blank">
			{title}
			<ExternalLinkIcon />
		</Button>
	{/each}
</div>
