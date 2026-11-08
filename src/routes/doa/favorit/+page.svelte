<script lang="ts">
	import BackBar from '#lib/components/BackBar.svelte';
	import DoaList from '#lib/components/DoaList.svelte';

	let { data } = $props();
</script>

<svelte:head><title>Doa favorit · Muslims Daily</title></svelte:head>

<BackBar fallback="/doa" />

<header class="page-head">
	<div class="label">Kumpulan doa</div>
	<h1>Favorit</h1>
</header>

<DoaList
	items={data.items}
	categories={data.categories}
	searchable={false}
	onlyFavs
	empty="Belum ada favorit. Ketuk ikon hati di doa yang sering kamu baca."
/>
