<script lang="ts">
	import { Button } from './ui/button';
	import TelegramIcon from './icons/TelegramIcon.svelte';
	import Donut from '@lucide/svelte/icons/donut';
	import GithubIcon from '@lucide/svelte/icons/github';

	const contacts = [
		{ href: 'https://dalink.to/esouqu', title: 'Поддержать', Icon: Donut },
		{ href: 'https://t.me/esouqu', title: 'Написать', Icon: TelegramIcon },
		{ href: 'https://github.com/Esouqu/Stream-Video-Queue', title: 'Посмотреть', Icon: GithubIcon }
	];
</script>

<div class="flex w-full justify-center gap-3">
	{#each contacts as { title, href, Icon } (title)}
		<Button
			class="text-muted-foreground hover:text-foreground"
			{href}
			target="_blank"
			variant="link"
			draggable="false"
		>
			<Icon class="size-6" />
			{title}
		</Button>
	{/each}
</div>
