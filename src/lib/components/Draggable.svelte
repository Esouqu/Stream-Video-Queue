<script lang="ts">
	import { fade } from 'svelte/transition';
	import Play from 'lucide-svelte/icons/play';
	import GripVertical from 'lucide-svelte/icons/grip-vertical';
	import { draggable, type DragEventData, type DragOptions } from '@neodrag/svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		isSelected?: boolean;
		isWatched?: boolean;
		onSwipe: () => void;
		children: Snippet;
	}

	let { isSelected = false, isWatched = false, onSwipe, children }: Props = $props();

	let position = $state({ x: 0, y: 0 });
	let isReachedEnd = $state(false);
	let isDragged = $state(false);
	let draggableOptions: DragOptions = $derived({
		axis: 'x',
		position,
		handle: '.drag-handler',
		applyUserSelectHack: true,
		onDragStart,
		onDrag,
		onDragEnd
	});

	function onDragStart() {
		isDragged = true;
		document.body.classList.add('grabbing');

		// position = { x: 0, y: 0 };
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
		if (offsetX >= 100) onSwipe();

		isDragged = false;
		isReachedEnd = false;
		position = { x: 0, y: 0 };

		document.body.classList.remove('grabbing');
	}
</script>

<div
	class="queue-item"
	class:selected={isSelected}
	class:watched={isWatched}
	class:dragged={isDragged}
	use:draggable={draggableOptions}
>
	<div class="drag-handler" class:draggable={!isSelected}>
		{#if isSelected}
			<Play size="1.25rem" fill="#e5e7eb" strokeWidth="0" />
		{:else}
			<GripVertical size="1.25rem" />
		{/if}
	</div>

	{@render children()}

	<div class="queue-item-delete-bg">
		{#if isReachedEnd}
			<p class="text-sm text-primary-foreground" transition:fade={{ duration: 100 }}>Удалить</p>
		{/if}
	</div>
</div>

<style lang="scss">
	.queue-item {
		position: relative;
		display: flex;
		flex-direction: row;
		padding-right: 0.5rem;
		border-radius: 0.5rem;
		width: 100%;
		transition: 0.2s;
		cursor: pointer;

		& .drag-handler {
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 0 0.5rem;
			user-select: none;
			cursor: grab;

			&:not(.draggable) {
				pointer-events: none;
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
			z-index: -1;
			border-radius: 0.5rem;
			width: 0%;
			height: 100%;
			opacity: 0.5;
			background: linear-gradient(90deg, hsl(var(--primary)) 0%, rgba(255 255 255 / 0) 100%);
			transition: 0.3s;
		}

		&.dragged {
			transition: none;
		}

		&.watched {
			opacity: 0.33;

			&.selected {
				opacity: 1;
			}
		}

		&.selected {
			cursor: default;

			&::before {
				width: 45%;
				opacity: 1;
			}

			&:hover {
				background-color: hsl(var(--muted));
			}
		}

		&-delete-bg {
			position: absolute;
			top: 50%;
			left: -100px;
			z-index: -1;
			display: flex;
			justify-content: center;
			align-items: center;
			width: 100px;
			height: 90%;
			translate: 0 -50%;
			font-weight: 500;
			font-size: 0.9rem;
			color: var(--on-container);
			background: linear-gradient(90deg, rgba(255 255 255 / 0) 0%, hsl(var(--primary)) 100%);
			pointer-events: none;
		}

		&:hover {
			background-color: hsl(var(--muted));
		}

		&:active {
			background-color: transparent;
		}
	}
</style>
