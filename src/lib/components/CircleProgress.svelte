<script lang="ts">
	interface Props {
		class: string;
	}

	const { class: className }: Props = $props();
</script>

<div class="loader {className}"></div>

<style lang="scss">
	.loader {
		width: 0.875rem;
		aspect-ratio: 1;
		border: 0.25rem solid transparent;
		border-radius: 50%;
		position: relative;
		transform: rotate(45deg);
	}

	.loader::before {
		content: '';
		position: absolute;
		inset: -0.25rem;
		border-radius: 50%;
		border: 0.25rem solid hsl(var(--primary));
		animation: l18 1s linear;
	}

	@keyframes l18 {
		0% {
			clip-path: polygon(50% 50%, 0 0, 0 0, 0 0, 0 0, 0 0);
		}
		25% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 0, 100% 0, 100% 0);
		}
		50% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 100% 100%, 100% 100%);
		}
		75% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 100%);
		}
		100% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 0);
		}
	}
</style>
