<script lang="ts">
	import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import SettingsIcon from 'lucide-svelte/icons/settings';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import { buttonVariants } from '../ui/button';
	import { Separator } from '../ui/separator';
	import TwitchSettings from './TwitchSettings.svelte';
	import DonationAlertsSettings from './DonationAlertsSettings.svelte';
	import Contacts from '../Contacts.svelte';
	import PlayerSettings from './PlayerSettings.svelte';
	import TimerSettings from './TimerSettings.svelte';

	const tabsStyle = 'w-full justify-start data-[state=active]:bg-muted gap-4';
</script>

<Dialog>
	<DialogTrigger class={buttonVariants({ variant: 'outline', size: 'icon' })}>
		<SettingsIcon />
	</DialogTrigger>
	<DialogContent class="flex aspect-3/2 h-[35rem] w-auto max-w-none flex-col gap-0 p-0">
		<DialogHeader class="p-4">
			<DialogTitle>Настройки</DialogTitle>
		</DialogHeader>

		<Separator orientation="horizontal" />

		<Tabs class="flex h-full overflow-hidden">
			<TabsList class="flex h-auto w-1/3 flex-col justify-between bg-transparent p-4">
				<div class="flex flex-col gap-2">
					<div>
						<TabsTrigger class={tabsStyle} value="player">Плеер</TabsTrigger>
						<TabsTrigger class={tabsStyle} value="timer">Таймер</TabsTrigger>
					</div>

					<Separator />

					<div>
						<TabsTrigger class={tabsStyle} value="twitch">Twitch</TabsTrigger>
						<TabsTrigger class={tabsStyle} value="donationalerts">DonationAlerts</TabsTrigger>
					</div>
				</div>
				<Contacts class="w-full flex-col" />
			</TabsList>

			<Separator orientation="vertical" />

			<ScrollArea class="h-full w-full gap-0 p-6">
				<TabsContent value="player" class="m-0">
					<PlayerSettings />
				</TabsContent>

				<TabsContent value="timer" class="m-0">
					<TimerSettings />
				</TabsContent>

				<TabsContent value="twitch" class="m-0 h-full">
					<TwitchSettings />
				</TabsContent>

				<TabsContent value="donationalerts" class="m-0 h-full">
					<DonationAlertsSettings />
				</TabsContent>
			</ScrollArea>
		</Tabs>
	</DialogContent>
</Dialog>
