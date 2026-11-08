<script lang="ts">
	import { tr } from '#lib/i18n.svelte.ts';
	import { onMount } from 'svelte';
	import CatIcon from './CatIcon.svelte';
	import Icon from './Icon.svelte';
	import Picker from './Picker.svelte';
	import StarNum from './StarNum.svelte';
	import { withTransition as vt } from '#lib/transition.ts';
	import { doaHref, normalize, type Category, type DoaItem } from '#lib/data/doa.ts';
	import { dateKey } from '#lib/date.ts';
	import { clock, doaPrefs, toast, type DoaPrefs } from '#lib/state/app.svelte.ts';

	/**
	 * Daftar doa dengan pencarian, urutan, dan pilihan tampilan kartu/daftar.
	 * Dipakai halaman Semua doa, Favorit, Koleksi, dan halaman tiap kategori.
	 */
	let {
		items,
		categories,
		showCategory = true,
		searchable = true,
		onlyFavs = false,
		only = null,
		empty
	}: {
		items: DoaItem[];
		categories: Category[];
		showCategory?: boolean;
		searchable?: boolean;
		onlyFavs?: boolean;
		/** hanya doa dengan id ini (isi koleksi) */
		only?: number[] | null;
		empty?: string;
	} = $props();

	let q = $state('');
	let input: HTMLInputElement | undefined = $state();

	// Dari kolom cari di halaman Doa (/doa/semua?cari): langsung fokus ke pencarian.
	onMount(() => {
		if (new URLSearchParams(location.search).has('cari')) input?.focus();
	});

	const catName = $derived(Object.fromEntries(categories.map((c) => [c.slug, c.short])));
	const catOrder = $derived(Object.fromEntries(categories.map((c, i) => [c.slug, i])));
	const order = $derived(new Map(items.map((d, i) => [d.id, i])));

	const prefs = $derived(doaPrefs.value);
	const favs = $derived(new Set(prefs.favs));
	const todayKey = $derived(clock.now ? dateKey(clock.now) : '');
	const readToday = $derived(new Set(prefs.readOn === todayKey ? prefs.read : []));

	const SORTS: Record<DoaPrefs['sort'], (a: DoaItem, b: DoaItem) => number> = {
		kat: (a, b) => catOrder[a.category] - catOrder[b.category] || order.get(a.id)! - order.get(b.id)!,
		az: (a, b) => a.title.localeCompare(b.title, 'id'),
		short: (a, b) => a.words - b.words,
		long: (a, b) => b.words - a.words
	};

	// $derived supaya label ikut berganti saat bahasa diubah
	const SORT_OPTIONS: { value: DoaPrefs['sort']; label: string }[] = $derived([
		{ value: 'kat', label: tr('Urutan bawaan', 'Default order') },
		{ value: 'az', label: tr('Urut A sampai Z', 'A to Z') },
		{ value: 'short', label: tr('Terpendek dulu', 'Shortest first') },
		{ value: 'long', label: tr('Terpanjang dulu', 'Longest first') }
	]);

	const noMatch = $derived(tr('Belum ada doa yang cocok. Coba kata lain.', 'No matching duas yet. Try another word.'));
	const readingsLabel = (n: number) => tr(`${n} bacaan`, `${n} ${n === 1 ? 'reading' : 'readings'}`);

	const results = $derived.by(() => {
		const nq = normalize(q.trim());
		const pick = only ? new Set(only) : null;
		return items
			.filter((d) => (!onlyFavs || favs.has(d.id)) && (!pick || pick.has(d.id)) && (!nq || d.search.includes(nq)))
			.toSorted(SORTS[prefs.sort]);
	});

	function setPrefs(p: Partial<DoaPrefs>) {
		vt(() => (doaPrefs.value = { ...doaPrefs.value, ...p }));
	}

	function fav(e: Event, id: number) {
		e.preventDefault();
		e.stopPropagation();
		const has = favs.has(id);
		const apply = () => (doaPrefs.value = { ...prefs, favs: has ? prefs.favs.filter((x) => x !== id) : [...prefs.favs, id] });
		if (onlyFavs) vt(apply);
		else apply();
		toast.say(has ? tr('Dihapus dari favorit', 'Removed from favorites') : tr('Disimpan ke favorit', 'Saved to favorites'));
	}
</script>

{#if searchable}
	<label class="search">
		<Icon name="search" />
		<span class="sr-only">{tr('Cari doa', 'Search duas')}</span>
		<input bind:this={input} bind:value={q} placeholder={tr('Cari doa: hujan, rezeki, tidur', 'Search in Indonesian: hujan, rezeki, tidur')} autocomplete="off" type="search" />
	</label>
{/if}

<div class="toolbar">
	<Picker label={tr('Urutkan', 'Sort')} size="sm" options={SORT_OPTIONS} value={prefs.sort} onchange={(v) => setPrefs({ sort: v as DoaPrefs['sort'] })} />
	<div class="seg vt" role="group" aria-label={tr('Tampilan', 'View')}>
		<button aria-pressed={prefs.view === 'card'} aria-label={tr('Tampilan kartu', 'Card view')} onclick={() => setPrefs({ view: 'card' })}><Icon name="cards" size={17} /></button>
		<button aria-pressed={prefs.view === 'list'} aria-label={tr('Tampilan daftar', 'List view')} onclick={() => setPrefs({ view: 'list' })}><Icon name="list" size={17} /></button>
	</div>
</div>

<div class="label count">{tr(`${results.length} doa`, `${results.length} ${results.length === 1 ? 'dua' : 'duas'}`)}</div>

{#if !results.length}
	<p class="empty">{q ? noMatch : (empty ?? noMatch)}</p>
{:else if prefs.view === 'card'}
	<div class="cards">
		{#each results as d, i (d.id)}
			<a class="card dcard" href={doaHref(d)}>
				<div class="head">
					<StarNum n={i + 1} />
					<!-- Warnanya mengikuti kartu kategori yang sama di halaman Doa. -->
					<span class="dico" class:alt={catOrder[d.category] % 4 === 1 || catOrder[d.category] % 4 === 2}><CatIcon slug={d.category} size={20} /></span>
					<span class="grow">{#if readToday.has(d.id)}<span class="read">{tr('Dibaca', 'Read')}</span>{/if}</span>
					<button class="fav" class:on={favs.has(d.id)} aria-label={tr('Favorit', 'Favorite')} aria-pressed={favs.has(d.id)} onclick={(e) => fav(e, d.id)}>
						<Icon name="heart" />
					</button>
				</div>
				<h2 class="t disp">{d.title}</h2>
				{#if showCategory || d.readings > 1}
					<div class="meta">
						{#if showCategory}<span class="ell">{catName[d.category]}</span>{/if}
						{#if showCategory && d.readings > 1}<span class="dot"></span>{/if}
						{#if d.readings > 1}<span class="nw">{readingsLabel(d.readings)}</span>{/if}
					</div>
				{/if}
			</a>
		{/each}
	</div>
{:else}
	<div class="card rows">
		{#each results as d, i (d.id)}
			<a class="drow" href={doaHref(d)}>
				<StarNum n={i + 1} />
				<div class="grow min">
					<p class="t">{d.title}</p>
					{#if showCategory || d.readings > 1 || readToday.has(d.id)}
						<div class="meta">
							{#if showCategory}<span class="ell">{catName[d.category]}</span>{/if}
							{#if showCategory && d.readings > 1}<span class="dot"></span>{/if}
							{#if d.readings > 1}<span class="nw">{readingsLabel(d.readings)}</span>{/if}
							{#if readToday.has(d.id) && (showCategory || d.readings > 1)}<span class="dot"></span>{/if}
							{#if readToday.has(d.id)}<span class="read">{tr('Dibaca', 'Read')}</span>{/if}
						</div>
					{/if}
				</div>
				<button class="fav" class:on={favs.has(d.id)} aria-label={tr('Favorit', 'Favorite')} aria-pressed={favs.has(d.id)} onclick={(e) => fav(e, d.id)}>
					<Icon name="heart" />
				</button>
			</a>
		{/each}
	</div>
{/if}

<style>
	.search {
		display: flex;
		align-items: center;
		gap: 10px;
		height: 48px;
		padding: 0 14px;
		border-radius: 16px;
		background: var(--card);
		box-shadow: var(--shadow);
		border: 1px solid var(--line);
		color: var(--ink3);
	}
	.search input {
		flex: 1;
		border: 0;
		background: none;
		font: inherit;
		font-size: 14px;
		color: var(--ink);
		outline: none;
		min-width: 0;
	}
	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 14px 2px 10px;
	}
	.vt button {
		width: 36px;
		height: 28px;
		display: grid;
		place-items: center;
		padding: 0;
	}
	.count {
		margin: 0 2px 10px;
	}
	.empty {
		text-align: center;
		padding: 40px 10px;
		color: var(--ink2);
		font-size: 13.5px;
		line-height: 1.6;
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 10px;
	}
	.dcard {
		display: flex;
		flex-direction: column;
		padding: 10px 10px 12px 12px;
		text-decoration: none;
		transition:
			transform 0.25s var(--ease),
			box-shadow 0.25s;
	}
	.dcard:hover {
		transform: translateY(-2px);
	}
	.dcard:active {
		transform: scale(0.985);
	}
	.head {
		display: flex;
		align-items: center;
		gap: 6px;
		margin: 0 0 10px -4px;
	}
	.head .read {
		font-size: 11px;
		font-weight: 700;
	}
	.grow {
		flex: 1;
	}
	.min {
		min-width: 0;
	}
	.dico {
		flex: none;
		width: 36px;
		height: 36px;
		border-radius: 13px;
		display: grid;
		place-items: center;
		background: var(--navy-soft);
		color: var(--navy);
	}
	.dico.alt {
		background: var(--peach-soft);
		color: var(--peach-ink);
	}
	.t {
		margin: 0;
	}
	.dcard .t {
		font-weight: 500;
		font-size: 15.5px;
		line-height: 1.28;
		letter-spacing: -0.01em;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.dcard .meta {
		margin-top: auto;
		padding-top: 8px;
	}
	.nw {
		flex: none;
		white-space: nowrap;
	}
	.meta {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 11.5px;
		color: var(--ink2);
		font-weight: 600;
		margin-top: 6px;
	}
	.drow .meta {
		margin-top: 2px;
	}
	.dot {
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: var(--ink3);
		flex: none;
	}
	.read {
		color: var(--navy);
	}
	.ell {
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.rows {
		padding: 4px 12px;
	}
	.drow {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 4px;
		border-bottom: 1px solid var(--line);
		text-decoration: none;
	}
	.drow:last-child {
		border-bottom: 0;
	}
	.drow .t {
		font-weight: 700;
		font-size: 14.5px;
	}
	.fav {
		width: 36px;
		height: 36px;
		flex: none;
		border-radius: 50%;
		display: grid;
		place-items: center;
		color: var(--ink3);
		transition:
			transform 0.25s var(--ease),
			color 0.25s;
	}
	.fav.on {
		color: var(--rose);
	}
	.fav.on :global(svg) {
		fill: var(--rose);
	}
	.fav:active {
		transform: scale(1.25);
	}
</style>
