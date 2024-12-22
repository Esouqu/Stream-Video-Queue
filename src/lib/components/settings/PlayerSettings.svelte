<script lang="ts">
	import appManager from '$lib/scripts/AppManager.svelte';
	import SettingWrapper from './SettingWrapper.svelte';
	import SettingCard from './SettingCard.svelte';
	import SettingSection from './SettingSection.svelte';
	import { Switch } from '../ui/switch';
</script>

<SettingSection>
	{#snippet header()}<h2>Плеер</h2>{/snippet}
	{#snippet content()}
		<SettingCard>
			{#snippet header()}
				<SettingWrapper
					title="Автовоспроизведение"
					description="Автоматически воспроизводить видео"
					isHeader
				>
					<Switch bind:checked={appManager.playerSettings.shouldAutoplay} />
				</SettingWrapper>
			{/snippet}
		</SettingCard>
		<SettingCard>
			{#snippet header()}
				<SettingWrapper
					title="Автопереход"
					description="Автоматически переходить на следующее видео по окончанию текущего"
					isHeader
				>
					<Switch bind:checked={appManager.playerSettings.shouldPlayNextVideo} />
				</SettingWrapper>
			{/snippet}
		</SettingCard>
	{/snippet}
</SettingSection>
