<script lang="ts">
	import { tr } from '#lib/i18n.svelte.ts';
	import BackBar from '#lib/components/BackBar.svelte';
	import DoaIndexList from '#lib/components/DoaIndexList.svelte';

</script>

<svelte:head><title>{tr('Doa favorit', 'Favorite duas')} · Muslims Daily</title></svelte:head>

<BackBar fallback="/doa" />

<header class="page-head">
	<div class="label">{tr('Kumpulan doa', 'Duas')}</div>
	<h1>{tr('Favorit', 'Favorites')}</h1>
</header>

<DoaIndexList
	searchable={false}
	onlyFavs
	empty={tr('Belum ada favorit. Ketuk ikon hati di doa yang sering kamu baca.', 'No favorites yet. Tap the heart on the duas you read often.')}
/>
