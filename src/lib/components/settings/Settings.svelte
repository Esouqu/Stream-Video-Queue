<script lang="ts">
	import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import SettingsIcon from 'lucide-svelte/icons/settings';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import { buttonVariants } from '../ui/button';
	import TwitchSettings from './TwitchSettings.svelte';
	import DonationAlertsSettings from './DonationAlertsSettings.svelte';
	import Contacts from '../Contacts.svelte';
	import PlayerSettings from './PlayerSettings.svelte';

	const tabs = [
		{ value: 'player', label: 'Плеер', ComponentContent: PlayerSettings },
		{ value: 'twitch', label: 'Twitch', ComponentContent: TwitchSettings },
		{ value: 'donationalerts', label: 'DonationAlerts', ComponentContent: DonationAlertsSettings }
	];
</script>

<Dialog>
	<DialogTrigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
		<SettingsIcon />
	</DialogTrigger>
	<DialogContent class="flex aspect-3/2 h-[35rem] w-auto max-w-none flex-col gap-0 p-0">
		<DialogHeader class="p-4">
			<DialogTitle>Настройки</DialogTitle>
		</DialogHeader>

		<Tabs class="flex h-full overflow-hidden">
			<TabsList
				class="flex h-auto w-1/3 flex-col justify-between bg-[hsl(240deg_8.7%_9.02%_/_30%)] p-4"
			>
				<div>
					{#each tabs as { value, label }}
						<TabsTrigger class="w-full justify-start gap-4 data-[state=active]:bg-muted" {value}>
							{label}
						</TabsTrigger>
					{/each}
				</div>
				<Contacts class="w-full flex-col" />
			</TabsList>

			<ScrollArea class="h-full w-full">
				{#each tabs as { value, ComponentContent }}
					<TabsContent {value} class="m-0 h-full p-6">
						<ComponentContent />
					</TabsContent>
				{/each}
			</ScrollArea>
		</Tabs>
	</DialogContent>
</Dialog>
