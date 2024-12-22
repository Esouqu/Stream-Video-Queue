<script lang="ts">
	import appManager from '$lib/scripts/AppManager.svelte';
	import Input from '$lib/components/Input.svelte';
	import { page } from '$app/stores';
	import SettingWrapper from './SettingWrapper.svelte';
	import Integration from '../Integration.svelte';
	import DonationAlertsIcon from '../icons/DonationAlertsIcon.svelte';
	import { goto } from '$app/navigation';
	import SettingCard from './SettingCard.svelte';
	import SettingSection from './SettingSection.svelte';
	import { Switch } from '../ui/switch';

	let donationAlertsUser = $state($page.data.donationAlertsUserData);

	function onLogout() {
		fetch('/api/donationalerts/logout');
		donationAlertsUser = undefined;
	}

	function onAuth() {
		goto('/api/donationalerts/auth');
	}
</script>

{#snippet icon()}
	<DonationAlertsIcon color="#f57507" />
{/snippet}

<SettingSection isExtended={!!donationAlertsUser?.id}>
	{#snippet header()}
		<Integration
			title="DonationAlerts"
			username={donationAlertsUser?.name}
			{icon}
			{onAuth}
			{onLogout}
		/>
	{/snippet}
	{#snippet content()}
		{#if donationAlertsUser?.id}
			<SettingCard>
				{#snippet header()}
					<SettingWrapper
						title="Заказ видео"
						description="Заказаные видео будут находиться в начале очереди"
						isHeader
					/>
				{/snippet}
				{#snippet content()}
					<SettingWrapper title="Минимальная стоимость">
						<Input
							id="donation-request-price"
							type="number"
							suffix="руб"
							placeholder="Значение"
							bind:value={appManager.donationSettings.requestPrice}
						/>
					</SettingWrapper>
				{/snippet}
			</SettingCard>

			<SettingCard isExtended={appManager.donationSettings.isSkipEnabled}>
				{#snippet header()}
					<SettingWrapper
						title="Пропуск видео"
						description="Пропускать текущее видео, если сумма доната равна указанному значению"
						isHeader
					>
						<Switch
							id="donation-skip-enable"
							bind:checked={appManager.donationSettings.isSkipEnabled}
						/>
					</SettingWrapper>
				{/snippet}
				{#snippet content()}
					<SettingWrapper
						title="Динамическая стоимость"
						description="Стоимостью пропуска будет являться указанный процент от стоимости текущего видео"
					>
						<Switch bind:checked={appManager.donationSettings.isSkipDynamic} />
					</SettingWrapper>
					<SettingWrapper
						title={appManager.donationSettings.isSkipDynamic ? 'Процент (%)' : 'Стоимость (RUB)'}
					>
						<Input
							id="donation-skip-price"
							type="number"
							placeholder="Значение"
							bind:value={appManager.donationSettings.skipPrice}
						/>
					</SettingWrapper>
				{/snippet}
			</SettingCard>
		{/if}
	{/snippet}
</SettingSection>
