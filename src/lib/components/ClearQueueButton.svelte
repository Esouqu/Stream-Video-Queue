<script lang="ts">
	import appStore from '$lib/stores/AppStore.svelte';
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
	} from './ui/alert-dialog';
	import { buttonVariants, type ButtonSize } from './ui/button';

	type Props = {
		size?: ButtonSize;
	};

	const { size = 'default' }: Props = $props();

	let isAlertOpened = $state(false);

	function onAlertAction() {
		appStore.clearQueue();
		isAlertOpened = false;
	}
</script>

<AlertDialog bind:open={isAlertOpened}>
	<AlertDialogTrigger
		class={buttonVariants({ variant: 'destructive', size })}
		disabled={appStore.queue.isEmpty}
	>
		Очистить
	</AlertDialogTrigger>

	<AlertDialogContent class="w-113">
		<AlertDialogHeader>
			<AlertDialogTitle>Вы уверены?</AlertDialogTitle>
			<AlertDialogDescription class="whitespace-pre-line">
				Нажимая «Удалить», вы <b>навсегда</b> удалите все видео.
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel>Отмена</AlertDialogCancel>
			<AlertDialogAction
				class={buttonVariants({ variant: 'destructive', size })}
				onclick={onAlertAction}
			>
				Удалить
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
