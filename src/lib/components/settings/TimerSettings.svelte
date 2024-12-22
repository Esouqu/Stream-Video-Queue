<script lang="ts">
	import Input from '$lib/components/Input.svelte';
	import SettingWrapper from './SettingWrapper.svelte';
	import SettingSection from './SettingSection.svelte';
	import SettingCard from './SettingCard.svelte';
	import appManager from '$lib/scripts/AppManager.svelte';
	import Select from '../Select.svelte';
	import { Switch } from '../ui/switch';
</script>

<SettingSection>
	{#snippet header()}Таймер{/snippet}
	{#snippet content()}
		<SettingCard isExtended={appManager.timer.isEnabled}>
			{#snippet header()}
				<SettingWrapper title="Отсчитывать время" isHeader>
					<Switch bind:checked={appManager.timer.isEnabled} />
				</SettingWrapper>
			{/snippet}
			{#snippet content()}
				<SettingWrapper title="Стоимость за секунду">
					<Input id="timer-value" bind:value={appManager.timer.pricePerSecond} />
				</SettingWrapper>
				<SettingWrapper title="По окончанию таймера">
					<Select
						items={[
							{ label: 'Ничего', value: 'none' },
							{ label: 'Пауза', value: 'pause' },
							{ label: 'Следующее видео', value: 'next' }
						]}
						bind:value={appManager.timer.onStateFinishedAction}
					/>
				</SettingWrapper>
			{/snippet}
		</SettingCard>
	{/snippet}
</SettingSection>
