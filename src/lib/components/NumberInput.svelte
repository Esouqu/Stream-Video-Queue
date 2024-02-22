<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	export let id: number | string;
	export let value: number = 0;
	export let suffix: string | null = null;
	export let label: string | null = null;
	export let placeholder: string = '';
	export let element: HTMLInputElement | null = null;
	export let isDisabled = false;
	export let isFilled = false;
	export let isPreventInput = false;
	export let isBorderless = true;
	export let onEnter: (() => void) | null = null;
	export let onInput: (() => void) | null = null;
	export let onBlur: (() => void) | null = null;

	const pathName = $page.url.pathname;

	onMount(() => {
		if (!element || !isBorderless) return;

		element.style.width = 'auto';
		element.style.width = element.value.length * 9 + 'px';
	});

	function handleInput(e: Event) {
		if (isPreventInput) return;

		const target = e.target as HTMLInputElement;

		value = Number(target.value);

		if (isBorderless) {
			target.style.width = 'auto';
			target.style.width = target.value.length * 9 + 'px';
		}

		if (onInput) onInput();
	}

	function handleKeyDown(e: KeyboardEvent) {
		const target = e.target as HTMLInputElement;
		const isConfirmKey = e.code === 'Enter';

		// if (!onEnter || !isConfirmKey) return;
		// onEnter();
		if (isConfirmKey) {
			if (onEnter) onEnter();

			value = Number(target.value);
			target.blur();
		}
	}

	function handleBlur(e: Event) {
		const target = e.target as HTMLInputElement;

		if (!onBlur) return;

		value = Number(target.value);

		onBlur();
	}
</script>

<div
	class="input-wrapper"
	class:disabled={isDisabled}
	class:filled={isFilled}
	class:labeled={label}
	class:borderless={isBorderless}
	data-suffix={suffix}
>
	{#if label}
		<fieldset class="input-fieldset">
			<legend class="input-legend">
				<span>{label}</span>
			</legend>
		</fieldset>
	{/if}
	<input
		type="number"
		id="input-number-{id}-{pathName}"
		class="input"
		disabled={isDisabled}
		{placeholder}
		{value}
		bind:this={element}
		on:keydown={handleKeyDown}
		on:input|preventDefault={handleInput}
		on:blur|preventDefault={handleBlur}
		on:click={() => element?.select()}
	/>
</div>

<style lang="scss">
	.input {
		position: relative;
		padding: var(--input-p, 0);
		border: 1px solid var(--outline-variant);
		border-radius: 5px;
		outline: 0;
		min-width: 9px;
		width: var(--input-w, 20px);
		text-align: var(--input-text-al, center);
		text-decoration: none;
		color: var(--on-surface);
		background-color: transparent;
		transition:
			outline 0.2s,
			border-color 0.2s;

		&-fieldset {
			position: absolute;
			inset: -5px 0px 0px;
			margin: 0px;
			padding: 0px 8px;
			border: 1px solid var(--outline);
			border-radius: 5px;
			outline: 0;
			min-width: 0%;
			text-align: left;
			transition:
				outline-color 0.2s,
				border-color 0.2s;
			overflow: hidden;
			user-select: none;
		}

		&-legend {
			display: block;
			float: unset;
			padding: 0 2px;
			width: auto;
			max-width: 100%;
			height: 11px;
			font-size: 0.75em;
			color: var(--on-surface-variant);
			transition: max-width 100ms cubic-bezier(0, 0, 0.2, 1) 50ms;
			white-space: nowrap;
			overflow: hidden;
		}

		&-wrapper {
			position: relative;
			display: flex;
			gap: 10px;
			width: var(--input-w-w, auto);

			&.borderless {
				& .input {
					border: 0;
					border-radius: 0;
					cursor: pointer;

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
				&:not(.labeled) {
					background-color: var(--surface-container-highest);
				}
				& .input {
					&:focus {
						border-color: var(--primary);
					}

					&:hover:not(:focus):not(:disabled) {
						border-color: white;
					}
				}
			}

			&.labeled {
				& .input {
					border: 1px solid transparent;

					&:hover {
						border-color: transparent !important;
					}
					&:focus {
						border: 1px solid transparent;
					}
				}

				&:hover {
					& .input-fieldset {
						border-color: white;
					}
				}

				&:has(.input:focus) .input-fieldset {
					border: 3px solid var(--primary);
				}

				& .input-fieldset {
					background-color: var(--surface-container-highest);
				}

				& .input {
					outline: 0;
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
				cursor: text;
			}
		}

		&:focus {
			z-index: 999;
			outline: 2px solid var(--primary-60);
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
