<script lang="ts">
	import appManager from '$lib/scripts/AppManager.svelte';
	import TrashcanIcon from 'lucide-svelte/icons/trash-2';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogTrigger
	} from '$lib/components/ui/alert-dialog';
	import { buttonVariants } from './ui/button';

	interface Props {
		disabled?: boolean;
	}

	const { disabled }: Props = $props();

	let isAlertOpened = $state(false);

	function onAlertAction() {
		appManager.queue.clear();
		isAlertOpened = false;
	}
</script>

<AlertDialog bind:open={isAlertOpened}>
	<AlertDialogTrigger
		class={buttonVariants({
			variant: 'outline',
			size: 'icon'
		})}
		{disabled}
	>
		<TrashcanIcon />
	</AlertDialogTrigger>

	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Вы уверены?</AlertDialogTitle>
			<AlertDialogDescription>
				Это действие необратимо. Нажимая "Удалить", вы навсегда удалите все видео из очереди.
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel>Отмена</AlertDialogCancel>
			<AlertDialogAction onclick={onAlertAction}>Удалить</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
