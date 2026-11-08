<script lang="ts">
	import BackBar from '#lib/components/BackBar.svelte';
	import DoaList from '#lib/components/DoaList.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Semua doa · Muslims Daily</title>
	<meta name="description" content="Daftar lengkap {data.items.length} doa harian dengan teks Arab, transliterasi, dan terjemahan." />
</svelte:head>

<BackBar fallback="/doa" />

<header class="page-head">
	<div class="label">Kumpulan doa</div>
	<h1>Semua doa</h1>
</header>

<DoaList items={data.items} categories={data.categories} />
