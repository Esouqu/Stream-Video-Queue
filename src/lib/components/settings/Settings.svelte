<script lang="ts">
	import { ScrollArea } from '../ui/scroll-area';
	import DonationSection from './components/DonationSection.svelte';
	import QueueSection from './components/QueueSection.svelte';
	import ChatSection from './components/ChatSection.svelte';
	import IntegrationsSection from './components/IntegrationsSection.svelte';
	import Links from '../Links.svelte';
	import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
	import { Separator } from '../ui/separator';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	const settingsSections = [
		{ title: 'Интеграции', component: IntegrationsSection },
		{ title: 'Чат', component: ChatSection },
		{ title: 'Донат', component: DonationSection },
		{ title: 'Очередь', component: QueueSection }
	];

	function onOpenChange(open: boolean) {
		if (!open) {
			const newUrl = new URL(page.url);
			newUrl.searchParams.delete('settings');
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto(newUrl, { replaceState: true, keepFocus: true, noScroll: true });
		}
	}
</script>

<Sheet open={page.url.searchParams.get('settings') === 'open'} {onOpenChange}>
	<SheetContent class="w-150">
		<ScrollArea class="h-full w-full gap-0 overflow-hidden">
			<SheetHeader>
				<SheetTitle>Настройки</SheetTitle>
			</SheetHeader>

			<div class="space-y-6 px-6 pb-6">
				{#each settingsSections as section (section.title)}
					<div class="space-y-2">
						<div class="flex w-full items-center gap-4">
							<h2 class="text-xl font-semibold">{section.title}</h2>
							<Separator class="w-full shrink" />
						</div>
						<section.component />
					</div>
				{/each}

				<Links />
			</div>
		</ScrollArea>
	</SheetContent>
</Sheet>
