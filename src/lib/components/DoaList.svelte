<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from './Icon.svelte';
	import Picker from './Picker.svelte';
	import StarNum from './StarNum.svelte';
	import { withTransition as vt } from '#lib/transition.ts';
	import { doaHref, normalize, type Category, type DoaItem } from '#lib/data/doa.ts';
	import { dateKey } from '#lib/date.ts';
	import { clock, doaPrefs, toast, type DoaPrefs } from '#lib/state/app.svelte.ts';

	/**
	 * Daftar doa dengan pencarian, urutan, dan pilihan tampilan kartu/daftar.
	 * Dipakai halaman Semua doa, Favorit, dan halaman tiap kategori.
	 */
	let {
		items,
		categories,
		showCategory = true,
		searchable = true,
		onlyFavs = false,
		empty = 'Belum ada doa yang cocok. Coba kata lain.'
	}: {
		items: DoaItem[];
		categories: Category[];
		showCategory?: boolean;
		searchable?: boolean;
		onlyFavs?: boolean;
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

	const SORT_OPTIONS: { value: DoaPrefs['sort']; label: string }[] = [
		{ value: 'kat', label: 'Urutan bawaan' },
		{ value: 'az', label: 'Urut A sampai Z' },
		{ value: 'short', label: 'Terpendek dulu' },
		{ value: 'long', label: 'Terpanjang dulu' }
	];

	const results = $derived.by(() => {
		const nq = normalize(q.trim());
		return items.filter((d) => (!onlyFavs || favs.has(d.id)) && (!nq || d.search.includes(nq))).toSorted(SORTS[prefs.sort]);
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
		toast.say(has ? 'Dihapus dari favorit' : 'Disimpan ke favorit');
	}
</script>

{#if searchable}
	<label class="search">
		<Icon name="search" />
		<span class="sr-only">Cari doa</span>
		<input bind:this={input} bind:value={q} placeholder="Cari doa: hujan, rezeki, tidur" autocomplete="off" type="search" />
	</label>
{/if}

<div class="toolbar">
	<Picker label="Urutkan" size="sm" options={SORT_OPTIONS} value={prefs.sort} onchange={(v) => setPrefs({ sort: v as DoaPrefs['sort'] })} />
	<div class="seg vt" role="group" aria-label="Tampilan">
		<button aria-pressed={prefs.view === 'card'} aria-label="Tampilan kartu" onclick={() => setPrefs({ view: 'card' })}><Icon name="cards" size={17} /></button>
		<button aria-pressed={prefs.view === 'list'} aria-label="Tampilan daftar" onclick={() => setPrefs({ view: 'list' })}><Icon name="list" size={17} /></button>
	</div>
</div>

<div class="label count">{results.length} doa</div>

{#if !results.length}
	<p class="empty">{q ? 'Belum ada doa yang cocok. Coba kata lain.' : empty}</p>
{:else if prefs.view === 'card'}
	{#each results as d, i (d.id)}
		<a class="card dcard" href={doaHref(d)} style:animation-delay="{Math.min(i, 8) * 45}ms">
			<div class="head">
				<StarNum n={i + 1} />
				<span class="label grow">{showCategory ? catName[d.category] : `${d.readings} bacaan`}</span>
				<button class="fav" class:on={favs.has(d.id)} aria-label="Favorit" aria-pressed={favs.has(d.id)} onclick={(e) => fav(e, d.id)}>
					<Icon name="heart" />
				</button>
			</div>
			<p class="ar" lang="ar">{d.preview}</p>
			<h2 class="t disp">{d.title}</h2>
			<div class="meta">
				{#if showCategory && d.readings > 1}<span>{d.readings} bacaan</span><span class="dot"></span>{/if}
				<span class="num">{d.words} kata</span>
				{#if readToday.has(d.id)}<span class="dot"></span><span class="read">Dibaca</span>{/if}
			</div>
		</a>
	{/each}
{:else}
	<div class="card rows">
		{#each results as d, i (d.id)}
			<a class="drow" href={doaHref(d)} style:animation-delay="{Math.min(i, 10) * 30}ms">
				<StarNum n={i + 1} />
				<div class="grow min">
					<p class="t">{d.title}</p>
					<div class="meta">
						{#if showCategory}<span class="ell">{catName[d.category]}</span><span class="dot"></span>{/if}
						<span class="num">{d.words} kata</span>
						{#if readToday.has(d.id)}<span class="dot"></span><span class="read">Dibaca</span>{/if}
					</div>
				</div>
				<button class="fav" class:on={favs.has(d.id)} aria-label="Favorit" aria-pressed={favs.has(d.id)} onclick={(e) => fav(e, d.id)}>
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
	.dcard {
		display: block;
		padding: 16px 16px 14px;
		margin-bottom: 12px;
		text-decoration: none;
		animation: rise 0.4s var(--ease) both;
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
		gap: 10px;
	}
	.grow {
		flex: 1;
	}
	.min {
		min-width: 0;
	}
	.dcard .ar {
		font-size: 22px;
		margin: 10px 0 6px;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.t {
		margin: 0;
	}
	.dcard .t {
		font-weight: 500;
		font-size: 18px;
		letter-spacing: -0.01em;
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
		animation: rise 0.35s var(--ease) both;
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
