<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		ref = $bindable(),
		class: className,
		color = '#fafafa',
		edges = 12,
		growth = 4,
		seed = null,
		children = undefined
	} = $props();

	const width = 200;
	const height = 100;
	const padding = 20;

	const maskId = $derived(`blob-mask-${seed.slice(0, 8)}`);

	function getOffsets(edgesCount: number) {
		const parts = seed.split('-');

		if (parts.length > 2) {
			const seedSection = parts[2];
			return Array.from({ length: edgesCount }, (_, i) => {
				const charCode = seedSection.charCodeAt(i % seedSection.length) || 50;
				return (charCode % 10) / 10;
			});
		}

		return Array.from({ length: edgesCount }, () => Math.random());
	}

	const offsets = $derived.by(() => getOffsets(edges));

	let pathData = $derived.by(() => {
		const centerX = width / 2;
		const centerY = height / 2;
		const points = [];

		for (let i = 0; i < edges; i++) {
			const angle = (i / edges) * Math.PI * 2;
			const offset = offsets[i] ?? 0.5;

			const minRadiusX = centerX * (growth / 10);
			const maxRadiusX = centerX;
			const radiusX = minRadiusX + (maxRadiusX - minRadiusX) * offset;

			const minRadiusY = centerY * (growth / 10);
			const maxRadiusY = centerY;
			const radiusY = minRadiusY + (maxRadiusY - minRadiusY) * offset;

			points.push({
				x: centerX + Math.cos(angle) * radiusX,
				y: centerY + Math.sin(angle) * radiusY
			});
		}

		let d = `M ${(points[0].x + points[edges - 1].x) / 2} ${(points[0].y + points[edges - 1].y) / 2}`;

		for (let i = 0; i < edges; i++) {
			const current = points[i];
			const next = points[(i + 1) % edges];
			const xc = (current.x + next.x) / 2;
			const yc = (current.y + next.y) / 2;

			d += ` Q ${current.x} ${current.y}, ${xc} ${yc}`;
		}

		return d + ' Z';
	});
</script>

<div class={cn('relative inline-flex items-center justify-center', className)} bind:this={ref}>
	<svg
		class="pointer-events-none absolute top-0 left-0 z-0 size-full"
		viewBox="-{padding} -{padding} {width + padding * 2} {height + padding * 2}"
		preserveAspectRatio="xMidYMid slice"
		xmlns="http://w3.org"
	>
		<defs>
			<radialGradient id="{maskId}-gradient" cx="50%" cy="50%" r="50%">
				<stop offset="20%" stop-color="white" />
				<stop offset="80%" stop-color="transparent" />
			</radialGradient>

			<mask id={maskId}>
				<rect {width} {height} fill="url(#{maskId}-gradient)" />
			</mask>
		</defs>

		<path d={pathData} fill={color} mask="url(#{maskId})" />
	</svg>

	{#if children}
		<div class="relative z-1">
			{@render children()}
		</div>
	{/if}
</div>
