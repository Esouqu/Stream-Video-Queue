<script lang="ts">
	import { fly } from 'svelte/transition';

	export let value: number;

	$: slicedValue = value.toString().split('');
</script>

<div class="animated-counter">
	{#each slicedValue as digit, idx (digit + `${idx}`)}
		<div
			style="grid-column: {idx + 1}; grid-row: 1;"
			in:fly={{ y: -10, duration: 300 }}
			out:fly={{ y: 30, duration: 300 }}
		>
			{digit}
		</div>
	{/each}
</div>

<style lang="scss">
	.animated-counter {
		position: relative;
		display: grid;
		overflow: hidden;

		// &__digit {
		// 	display: flex;
		// 	flex-direction: column;
		// 	gap: 5px;
		// 	margin-top: 4px;
		// 	transition: 0.2s;

		// 	&[data-digit='1'] {
		// 		margin-top: calc(-18.4px * 1 + 4px);
		// 	}
		// 	&[data-digit='2'] {
		// 		margin-top: calc(-18.4px * 2 + 9px);
		// 	}
		// 	&[data-digit='3'] {
		// 		margin-top: calc(-18.4px * 3 + 9px);
		// 	}
		// 	&[data-digit='4'] {
		// 		margin-top: calc(-18.4px * 4 + 9px);
		// 	}
		// 	&[data-digit='5'] {
		// 		margin-top: calc(-18.4px * 5 + 9px);
		// 	}
		// 	&[data-digit='6'] {
		// 		margin-top: calc(-18.4px * 6 + 9px);
		// 	}
		// 	&[data-digit='7'] {
		// 		margin-top: calc(-18.4px * 7 + 9px);
		// 	}
		// 	&[data-digit='8'] {
		// 		margin-top: calc(-18.4px * 8 + 9px);
		// 	}
		// 	&[data-digit='9'] {
		// 		margin-top: calc(-18.4px * 9 + 9px);
		// 	}
		// 	&[data-digit='0'] {
		// 		margin-top: calc(-18.4px * 10 + 9px);
		// 	}
		// }
	}
</style>
