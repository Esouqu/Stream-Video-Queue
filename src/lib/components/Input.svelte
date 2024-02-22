<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	const pathName = $page.url.pathname;

	export let id: number | string;
	export let value: string = '';
	export let type: 'text' | 'number';
	export let placeholder: string = '';
	export let suffix: string = '';
	export let isFilled = false;
	export let isDisabled = false;
	export let isPreventInput = false;
	export let isBorderless = true;
	export let element: HTMLInputElement | null = null;
	export let onEnter: (() => void) | null = null;
	export let onInput: (() => void) | null = null;
	export let onBlur: (() => void) | null = null;

	onMount(() => {
		if (!element) return;

		element.style.width = 'auto';
		element.style.width = Math.max(50, (element.value.length + 1) * 9) + 'px';
	});

	function handleInput(e: Event) {
		if (isPreventInput) return;

		const target = e.target as HTMLInputElement;

		if (type === 'number') {
			parseInput(target.value);
		} else {
			value = target.value;
		}

		target.style.width = 'auto';
		target.style.width = (target.value.length + 1) * 9 + 'px';

		if (onInput) onInput();
	}

	function handleKeyDown(e: KeyboardEvent) {
		const target = e.target as HTMLInputElement;
		const isConfirmKey = e.code === 'Enter';

		if (!isConfirmKey) return;

		if (onEnter) onEnter();

		if (type === 'number') {
			parseInput(target.value);
		} else {
			value = target.value;
		}

		target.blur();
	}

	function handleBlur(e: Event) {
		const target = e.target as HTMLInputElement;

		if (!onBlur) return;

		if (type === 'number') {
			parseInput(target.value);
		} else {
			value = target.value;
		}

		onBlur();
	}

	function parseInput(inputValue: string) {
		value = inputValue;
		const parsedValue = value.match(/\d+/g)?.join('');
		value = parsedValue ?? '';
	}
</script>

<div
	class="input-wrapper"
	class:disabled={isDisabled}
	class:filled={isFilled}
	class:borderless={isBorderless}
	data-suffix={suffix}
>
	<input
		type="text"
		id="input-{id}-{pathName}"
		class="input"
		{value}
		{placeholder}
		spellcheck="false"
		bind:this={element}
		on:keydown={handleKeyDown}
		on:input|preventDefault={handleInput}
		on:blur|preventDefault={handleBlur}
		on:focus
	/>
</div>

<style lang="scss">
	.input {
		position: relative;
		padding: var(--input-p, 0);
		border-radius: 5px;
		outline: 0;
		min-width: 50px;
		width: var(--input-w, 50px);
		font-size: var(--input-font-size, 16px);
		font-weight: var(--input-font-weight, 400);
		text-align: var(--input-text-al, center);
		text-decoration: none;
		color: var(--on-surface);
		background-color: transparent;
		transition:
			outline 0.2s,
			border-color 0.2s;
		cursor: pointer;

		&-wrapper {
			position: relative;
			display: flex;
			gap: 10px;
			width: var(--input-w-w, auto);

			&.borderless {
				& .input {
					border: 0;
					border-radius: 0;

					&:focus {
						outline: 0;
					}
				}

				&::before {
					content: '';
					position: absolute;
					bottom: -2px;
					width: 100%;
					opacity: 0.5;
					outline: 1px dashed var(--on-surface);
					background-color: var(--on-surface);
				}
			}

			&.disabled {
				opacity: 0.5;
			}

			&.filled {
				& .input {
					background-color: var(--surface-container-highest);

					&:focus {
						border-color: var(--primary);
					}

					&:hover:not(:focus):not(:disabled) {
						border-color: white;
					}
				}
			}

			&::after {
				content: attr(data-suffix);
				position: absolute;
				top: 52%;
				right: 10px;
				z-index: 999;
				translate: 0 -50%;
				font-size: 14px;
				text-transform: capitalize;
				opacity: 0.7;
			}
		}

		&:focus {
			z-index: 999;
			outline: 3px solid var(--outline-variant);
			border-color: transparent;
		}

		&:hover:not(:focus):not(:disabled) {
			border-color: white;
		}

		&::selection {
			background-color: var(--primary-60);
		}

		&::-webkit-inner-spin-button {
			display: none;
		}
	}
</style>
