<script lang="ts">
	import { tr } from '#lib/i18n.svelte.ts';
	import BackBar from '#lib/components/BackBar.svelte';
	import CatIcon from '#lib/components/CatIcon.svelte';
	import DoaList from '#lib/components/DoaList.svelte';

	let { data } = $props();
	const c = $derived(data.category);
</script>

<svelte:head>
	<title>{c.name} · Muslims Daily</title>
	<meta
		name="description"
		content={tr(`Kumpulan ${c.name.toLowerCase()}`, c.name) + `: ${data.items.map((d) => d.title).join(', ')}.`}
	/>
</svelte:head>

<BackBar fallback="/doa" />

<header class="page-head head">
	<span class="ico"><CatIcon slug={c.slug} size={24} /></span>
	<div>
		<div class="label">{tr(`Kategori · ${c.count} doa`, `Category · ${c.count} ${c.count === 1 ? 'dua' : 'duas'}`)}</div>
		<h1>{c.short}</h1>
	</div>
</header>

<DoaList items={data.items} categories={data.categories} showCategory={false} searchable={c.count > 8} />

<style>
	.head {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.ico {
		width: 52px;
		height: 52px;
		flex: none;
		border-radius: 18px;
		display: grid;
		place-items: center;
		background: var(--navy-soft);
		color: var(--navy);
	}
</style>
