<script lang="ts">
	import { Input } from './ui/input';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props {
		id: string;
		class?: string;
		value?: string | number | null;
		type?: HTMLInputAttributes['type'];
		confirmAction?: 'enter/blur' | 'default';
		placeholder?: string;
		suffix?: string;
		isFilled?: boolean;
		disabled?: boolean;
		onConfirmation?: ((value: number | string | null) => void) | null;
	}

	let {
		id,
		class: className,
		type,
		value = $bindable(type === 'number' ? null : ''),
		confirmAction = 'default',
		placeholder = '',
		disabled = false,
		onConfirmation
	}: Props = $props();

	let ref: HTMLElement | null | undefined = $state();

	function onkeydown(e: KeyboardEvent) {
		if (confirmAction === 'enter/blur' && e.key === 'Enter') {
			onConfirmation?.(value);
			ref?.blur();
		}
	}

	function oninput(e: Event) {
		const target = e.target as HTMLInputElement;

		if (type === 'number') {
			value = Number(target.value);
		} else {
			value = target.value;
		}

		if (confirmAction === 'default') {
			onConfirmation?.(value);
		}
	}

	function onblur() {
		if (confirmAction === 'enter/blur') {
			onConfirmation?.(value);
		}
	}
</script>

<Input
	{id}
	{type}
	{value}
	{placeholder}
	{disabled}
	bind:ref
	{onkeydown}
	{oninput}
	{onblur}
	class={className}
/>
