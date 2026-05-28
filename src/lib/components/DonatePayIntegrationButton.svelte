<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import type { IntegrationData } from '$lib/types';
	import IntegrationButton from './IntegrationButton.svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from './ui/button';
	import { invalidateAll } from '$app/navigation';

	type Props = {
		integration: IntegrationData;
	};

	const { integration }: Props = $props();

	async function unlink() {
		const { data, error } = await authClient.donatepay.unlink();

		if (error) {
			console.log(error);
			toast.error(error.message || 'Не удалось отвязать DonatePay');
		} else if (data?.success) {
			toast.success('DonatePay Успешно отвязан!');
		}
	}

	async function link(apiKey: string) {
		const { data, error } = await authClient.donatepay.link({
			apiKey: apiKey
		});

		if (error) {
			toast.error(error.message || 'Не удалось привязать DonatePay');
		} else if (data?.success) {
			toast.success('DonatePay Успешно привязан!');
			invalidateAll();
		}
	}
</script>

<IntegrationButton {integration} {link} {unlink}>
	{#snippet apiKeyDescription()}
		Перейдите на страницу <Button
			variant="link"
			class="h-auto p-0"
			href="https://donatepay.ru/page/api"
			target="_blank">https://donatepay.ru/page/api</Button
		>, затем скопируйте значение поля "Ваш API ключ" и вставьте его в поле ниже.
	{/snippet}
</IntegrationButton>
