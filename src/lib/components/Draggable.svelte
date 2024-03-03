<script lang="ts">
	import { draggable } from '@neodrag/svelte';
	import { createEventDispatcher } from 'svelte';

	interface IDraggableEvents {
		dragstopmin: { offsetX: number };
		dragstopmax: { offsetX: number };
	}

	const dispatch = createEventDispatcher<IDraggableEvents>();

	export let handle: string;
	export let isReachedEnd = false;

	let isDragged = false;
	let position = { x: 0, y: 0 };
</script>

<div
	style="display: flex; transition: {isDragged ? 0 : 0.2}s;"
	use:draggable={{
		axis: 'x',
		position,
		handle,
		applyUserSelectHack: true,
		onDragStart: () => {
			isDragged = true;
			document.body.classList.add('grabbing');
		},
		onDrag: ({ offsetX }) => {
			isReachedEnd = false;

			if (offsetX >= 100) {
				position = { x: 100, y: 0 };
				isReachedEnd = true;
			} else if (offsetX <= 0) {
				position = { x: 0, y: 0 };
			}
		},
		onDragEnd: ({ offsetX }) => {
			if (offsetX >= 100) dispatch('dragstopmin', { offsetX });
			if (offsetX >= 200) dispatch('dragstopmax', { offsetX });

			isDragged = false;
			isReachedEnd = false;
			position = { x: 0, y: 0 };

			document.body.classList.remove('grabbing');
		}
	}}
>
	<slot />
</div>
