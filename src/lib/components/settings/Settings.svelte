<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import CogIcon from '../icons/CogIcon.svelte';
	import { buttonVariants } from '../ui/button';
	import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
	import { ScrollArea } from '../ui/scroll-area';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
	import DonationSettings from './components/DonationSettings.svelte';
	import QueueSettings from './components/QueueSettings.svelte';
	import ChatSettings from './components/ChatSettings.svelte';

	const tabs = [
		{ title: 'Чат', value: 'chat', component: ChatSettings },
		{ title: 'Донат', value: 'donation', component: DonationSettings },
		{ title: 'Очередь', value: 'queue', component: QueueSettings }
	];

	let currentTabId = $state(0);
	let direction = $state(1);

	let itemsSizes: (HTMLElement | null)[] = $state(new Array(tabs.length).fill(null));
	let prevWidthSum = $derived(
		itemsSizes.reduce(
			(acc, item, idx) => (currentTabId > idx ? acc + (item?.offsetWidth ?? 0) : acc),
			0
		)
	);
	let spanWidth = $derived(itemsSizes[currentTabId]?.offsetWidth);

	function getValue() {
		return currentTabId.toString();
	}

	function setValue(v: string) {
		direction = currentTabId < parseInt(v) ? 1 : -1;
		currentTabId = parseInt(v);
	}
</script>

<Dialog>
	<DialogTrigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
		<CogIcon />
	</DialogTrigger>

	<DialogContent
		class="flex h-185 w-170 flex-col gap-0 border-border/50 p-0"
		closeButtonClass="top-6 right-6"
	>
		<ScrollArea class="h-full w-full gap-0 overflow-hidden">
			<DialogHeader>
				<DialogTitle>Настройки</DialogTitle>
			</DialogHeader>
			<Tabs class="overflow-hidden bg-none" bind:value={getValue, setValue}>
				<TabsList class="mx-auto h-auto bg-card p-2">
					<div
						class="relative grid h-full w-full items-center"
						style="grid-template-columns: repeat({tabs.length}, 1fr);"
					>
						{#each tabs as { title }, idx (title)}
							<TabsTrigger
								bind:ref={itemsSizes[idx]}
								class="relative z-20 w-23 shrink gap-4 px-3 text-muted-foreground transition-colors duration-200 select-none hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-background"
								value={idx.toString()}
							>
								{title}
							</TabsTrigger>
						{/each}
						{#if spanWidth}
							<span
								class="pointer-events-none absolute top-0 left-0 z-10 h-full translate-y-1/2 rounded-sm bg-primary py-2 transition-all duration-300"
								style="width: {spanWidth}px; translate: {prevWidthSum}px 0;"
								in:fade={{ duration: 250 }}
							></span>
						{/if}
					</div>
				</TabsList>

				<div class="grid px-6">
					{#each tabs as tab, idx (tab.value)}
						{#if currentTabId === idx}
							<div
								class="col-start-1 row-start-1"
								in:fly={{ x: 300 * direction, duration: 300 }}
								out:fly={{ x: -300 * direction, duration: 300 }}
							>
								<TabsContent class="py-4" value={idx.toString()}>
									<tab.component />
								</TabsContent>
							</div>
						{/if}
					{/each}
				</div>
			</Tabs>
		</ScrollArea>
	</DialogContent>
</Dialog>
