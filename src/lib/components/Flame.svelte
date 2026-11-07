<script lang="ts">
	// Api streak: siluet padat sederhana (ujung melengkung ke kiri, satu lidah kecil di kanan),
	// sewarna dengan angka di sebelahnya. Digambar sendiri, tanpa library ikon.
	let { size = 20, lit = true }: { size?: number; lit?: boolean } = $props();
</script>

<svg viewBox="0 0 24 24" width={size} height={size} style:width="{size}px" style:height="{size}px" class:dim={!lit} aria-hidden="true">
	<path
		fill="currentColor"
		d="M10.2 2C12.6 4.4 14.4 6.8 14.6 9.8C15.6 9.1 16.3 8 16.6 6.8C18.3 8.9 19.2 11.5 19.2 14.2A7.2 7.2 0 0 1 4.8 14.2C4.8 10.9 6.5 8.7 8.3 6.8C9.4 5.6 10.3 4.1 10.2 2Z"
	/>
	<!-- Percikan peach di atas lidah kanan: satu-satunya aksen warna, warna matahari di ikon aplikasi. -->
	<circle class="spark" cx="18.7" cy="4.1" r="1.75" />
</svg>

<style>
	svg {
		flex: none;
		display: block;
	}
	.spark {
		fill: var(--peach);
	}
	.dim {
		opacity: 0.35;
	}
</style>
