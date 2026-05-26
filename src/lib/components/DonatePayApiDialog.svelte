<script lang="ts">
	import G from '$lib/stores/G.svelte';
	import { cn } from '$lib/utils';
	import { badgeVariants } from './ui/badge';
	import { Button } from './ui/button';
	import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
	import { Input } from './ui/input';

	type Props = {
		isOpen?: boolean;
	};

	let { isOpen = $bindable(false) }: Props = $props();

	let apiKey = $state('');
	let error = $state('');
	let isLoading = $state(false);

	async function saveApiKey() {
		isLoading = true;

		const user = await G.donatepayApi.getUser(apiKey);

		if (user) {
			G.donatepayApi.setUser({
				id: user.data.id,
				username: user.data.name
			});
			G.donatepayApi.setApiKey(apiKey);

			isOpen = false;
		} else {
			error = 'Неверный API ключ';
		}

		isLoading = false;
	}
</script>

<Dialog bind:open={isOpen}>
	<DialogContent class="w-lg p-4">
		<DialogHeader class="p-0 text-start">
			<DialogTitle>DonatePay API ключ</DialogTitle>
			<DialogDescription>
				Перейдите на страницу <Button
					variant="link"
					class="h-auto p-0"
					href="https://donatepay.ru/page/api"
					target="_blank">https://donatepay.ru/page/api</Button
				>, затем скопируйте значение поля "Ваш API ключ" и вставьте его в поле ниже.
			</DialogDescription>
		</DialogHeader>
		<div class="space-y-4">
			<div class="space-y-2">
				<span class={cn(badgeVariants({ variant: 'destructive' }), 'text-sm')}>
					Никому не показывайте свой API ключ
				</span>
				<Input
					id="donatepay-api-key"
					type="password"
					class="w-full"
					placeholder="Введите API ключ"
					maxlength={60}
					oninput={() => (error = '')}
					bind:value={apiKey}
				/>
			</div>
			<div class="flex items-center gap-4 justify-self-end">
				{#if error}
					<p class="text-destructive">{error}</p>
				{/if}
				<Button disabled={isLoading || apiKey.length !== 60 || error !== ''} onclick={saveApiKey}>
					Сохранить
				</Button>
			</div>
		</div>
	</DialogContent>
</Dialog>
