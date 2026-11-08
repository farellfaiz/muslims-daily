<script lang="ts">
	import { tr } from '#lib/i18n.svelte.ts';
	import BackBar from '#lib/components/BackBar.svelte';
	import DoaIndexList from '#lib/components/DoaIndexList.svelte';

</script>

<svelte:head>
	<title>{tr('Semua doa', 'All duas')} · Muslims Daily</title>
	<meta
		name="description"
		content={tr(
			'Daftar lengkap doa harian dengan teks Arab, transliterasi, dan terjemahan.',
			'The full list of daily duas with Arabic text, transliteration, and translation.'
		)}
	/>
</svelte:head>

<BackBar fallback="/doa" />

<header class="page-head">
	<div class="label">{tr('Kumpulan doa', 'Duas')}</div>
	<h1>{tr('Semua doa', 'All duas')}</h1>
</header>

<DoaIndexList />
