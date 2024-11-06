<script lang="ts">
	import { fade } from 'svelte/transition';
	import dragIcon from '$lib/assets/drag_indicator_icon.svg';
	import playIcon from '$lib/assets/play_arrow_icon.svg';
	import { draggable, type DragEventData } from '@neodrag/svelte';
	import Icon from './Icon.svelte';

	export let isSelected = false;
	export let onDelete: () => void;

	let position = { x: 0, y: 0 };
	let isReachedEnd = false;
	let isDragged = false;

	function onDragStart() {
		isDragged = true;
		document.body.classList.add('grabbing');
	}

	function onDrag({ offsetX }: DragEventData) {
		isReachedEnd = false;

		if (offsetX >= 100) {
			position = { x: 100, y: 0 };
			isReachedEnd = true;
		} else if (offsetX <= 0) {
			position = { x: 0, y: 0 };
		}
	}

	function onDragEnd({ offsetX }: DragEventData) {
		if (offsetX >= 100) onDelete();
		// if (offsetX >= 200) dispatch('dragstopmax', { offsetX });

		isDragged = false;
		isReachedEnd = false;
		position = { x: 0, y: 0 };

		document.body.classList.remove('grabbing');
	}
</script>

<div
	class="queue-item"
	class:selected={isSelected}
	style="transition: {isDragged ? 0 : 0.2}s;"
	use:draggable={{
		axis: 'x',
		handle: '.drag-handler',
		applyUserSelectHack: true,
		position,
		onDragStart,
		onDrag,
		onDragEnd
	}}
>
	<div class="drag-handler" class:draggable={!isSelected}>
		<Icon src={isSelected ? playIcon : dragIcon} />
	</div>
	<slot />
	<div class="queue-item-delete-bg">
		{#if isReachedEnd}
			<p transition:fade={{ duration: 100 }}>Удалить</p>
		{/if}
	</div>
</div>

<style lang="scss">
	.queue-item {
		position: relative;
		display: flex;
		flex-direction: row;
		padding: 5px 10px 5px 0;
		color: var(--on-surface);
		transition: background-color 0.2s;
		cursor: pointer;

		& .drag-handler {
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 0 10px 0 5px;
			user-select: none;
			cursor: grab;

			&:not(.draggable) {
				cursor: default;
			}

			&:active {
				opacity: 0.5;
				cursor: grabbing;
			}
		}
		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			width: 0%;
			height: 100%;
			opacity: 0.5;
			background: linear-gradient(90deg, var(--primary-60) 0%, rgba(255 255 255 / 0) 100%);
			transition: 0.3s;
		}

		&.selected {
			background-color: var(--hover-white);
			cursor: default;

			&::before {
				width: 35%;
				opacity: 1;
			}

			&:hover {
				background-color: rgba(255 255 255 / 10%);
			}
		}

		&-delete-bg {
			position: fixed;
			top: 0;
			left: -100px;
			z-index: -1;
			display: flex;
			justify-content: center;
			align-items: center;
			width: 100px;
			height: 100%;
			font-weight: 500;
			font-size: 0.9rem;
			color: var(--on-container);
			background-color: var(--secondary-container);
		}

		&:hover {
			background-color: var(--hover-white);
		}

		&:active {
			background-color: transparent;
		}
	}
</style>
