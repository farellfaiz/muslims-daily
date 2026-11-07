<script lang="ts">
	// Nomor di dalam bintang delapan (rub el hizb), seperti penanda ayat di mushaf.
	let { n }: { n: number | string } = $props();
</script>

<span class="star">
	<svg viewBox="0 0 34 34" aria-hidden="true">
		<g fill="none" stroke="var(--peach)" stroke-width="1">
			<rect x="8" y="8" width="18" height="18" rx="1.5" />
			<rect x="8" y="8" width="18" height="18" rx="1.5" transform="rotate(45 17 17)" />
		</g>
	</svg>
	<span class="n num">{n}</span>
</span>

<style>
	.star {
		position: relative;
		width: 34px;
		height: 34px;
		flex: none;
		display: grid;
		place-items: center;
		font-size: 11.5px;
		font-weight: 800;
		color: var(--navy);
	}
	svg {
		position: absolute;
		inset: 0;
	}
	.n {
		position: relative;
	}
</style>
