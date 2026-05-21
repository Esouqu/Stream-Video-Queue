<script lang="ts">
	import CogIcon from '../icons/CogIcon.svelte';
	import { buttonVariants } from '../ui/button';
	import { ScrollArea } from '../ui/scroll-area';
	import DonationSection from './components/DonationSection.svelte';
	import QueueSection from './components/QueueSection.svelte';
	import ChatSection from './components/ChatSection.svelte';
	import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';
	import IntegrationsSection from './components/IntegrationsSection.svelte';
	import InfoIcon from '../icons/InfoIcon.svelte';
	import Links from '../Links.svelte';
	import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
	import { Separator } from '../ui/separator';

	const settingsSections = [
		{ title: 'Интеграции', component: IntegrationsSection },
		{ title: 'Чат', component: ChatSection },
		{ title: 'Донат', component: DonationSection },
		{ title: 'Очередь', component: QueueSection }
	];
</script>

<Sheet>
	<SheetTrigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
		<CogIcon />
	</SheetTrigger>
	<SheetContent class="w-150">
		<ScrollArea class="h-full w-full gap-0 overflow-hidden">
			<SheetHeader>
				<SheetTitle>Настройки</SheetTitle>
			</SheetHeader>

			<div class="space-y-6 px-6 pb-6">
				<Card class="relative grid auto-rows-auto gap-x-4 gap-y-0 bg-blue-400/20 p-4">
					<CardHeader class="flex gap-2 p-0">
						<InfoIcon class="size-5 text-blue-300" />
						<div class="space-y-1">
							<CardTitle class="text-blue-300">Добавление видео</CardTitle>
							<CardDescription class="text-blue-400/80">
								В чате: <span class="bg-neutral-900 p-0.5 px-1 text-sm font-semibold">
									!rq &lt;ссылка на видео&gt;
								</span>;
								<b>или</b>

								в донате:
								<span class="bg-neutral-900 p-0.5 px-1 text-sm font-semibold">
									&lt;ссылка на видео&gt;
								</span>.
							</CardDescription>
						</div>
					</CardHeader>
				</Card>

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
