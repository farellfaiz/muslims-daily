<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import { withTransition } from '#lib/transition.ts';
	import StarNum from '#lib/components/StarNum.svelte';
	import { CATEGORIES, DOA, normalize, searchText, type Doa } from '#lib/data/doa.ts';
	import { dateKey } from '#lib/date.ts';
	import { clock, doaPrefs, toast, type DoaPrefs } from '#lib/state/app.svelte.ts';

	type Filter = 'Semua' | (typeof CATEGORIES)[number] | 'Favorit';
	const FILTERS: Filter[] = ['Semua', ...CATEGORIES, 'Favorit'];

	let filter = $state<Filter>('Semua');
	let q = $state('');

	const INDEX = DOA.map((d) => ({ d, text: searchText(d) }));
	const prefs = $derived(doaPrefs.value);
	const favs = $derived(new Set(prefs.favs));
	const todayKey = $derived(clock.now ? dateKey(clock.now) : '');
	const readToday = $derived(new Set(prefs.readOn === todayKey ? prefs.read : []));

	const SORTS: Record<DoaPrefs['sort'], (a: Doa, b: Doa) => number> = {
		kat: (a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) || a.id - b.id,
		az: (a, b) => a.title.localeCompare(b.title, 'id'),
		short: (a, b) => a.wordCount - b.wordCount,
		long: (a, b) => b.wordCount - a.wordCount
	};

	const results = $derived.by(() => {
		const nq = normalize(q.trim());
		return INDEX.filter(
			({ d, text }) =>
				(filter === 'Semua' || (filter === 'Favorit' ? favs.has(d.id) : d.category === filter)) &&
				(!nq || text.includes(nq))
		)
			.map(({ d }) => d)
			.sort(SORTS[prefs.sort]);
	});

	// Ganti tampilan / filter dengan transisi halus bila browser mendukung.
	const vt = withTransition;

	function setPrefs(p: Partial<DoaPrefs>) {
		vt(() => (doaPrefs.value = { ...doaPrefs.value, ...p }));
	}

	function fav(e: Event, id: number) {
		e.preventDefault();
		e.stopPropagation();
		const has = favs.has(id);
		doaPrefs.value = { ...prefs, favs: has ? prefs.favs.filter((x) => x !== id) : [...prefs.favs, id] };
		toast.say(has ? 'Dihapus dari favorit' : 'Disimpan ke favorit');
	}
</script>

<svelte:head>
	<title>Kumpulan doa · Muslims Daily</title>
	<meta name="description" content="Kumpulan doa harian lengkap dengan teks Arab, transliterasi, terjemahan, dan arti per kata." />
</svelte:head>

<header class="page-head">
	<div class="label">Kumpulan doa</div>
	<h1>Doa harian</h1>
</header>

<a class="card salat press" href="/dzikir?set=salat">
	<span class="sico" aria-hidden="true"></span>
	<span class="sgrow">
		<span class="st">Dzikir &amp; doa setelah salat</span>
		<span class="ss">Urutan lengkap dengan penghitung tasbih</span>
	</span>
	<Icon name="chevron" size={18} />
</a>

<label class="search">
	<Icon name="search" />
	<span class="sr-only">Cari doa</span>
	<input bind:value={q} placeholder="Cari doa: dhuha, rezeki, tidur" autocomplete="off" type="search" />
</label>

<div class="chips" role="group" aria-label="Filter kategori">
	{#each FILTERS as f (f)}
		<button class="chip" aria-pressed={filter === f} onclick={() => vt(() => (filter = f))}>
			{f}{f === 'Favorit' && prefs.favs.length ? ` · ${prefs.favs.length}` : ''}
		</button>
	{/each}
</div>

<div class="toolbar">
	<select aria-label="Urutkan" value={prefs.sort} onchange={(e) => setPrefs({ sort: e.currentTarget.value as DoaPrefs['sort'] })}>
		<option value="kat">Urut kategori</option>
		<option value="az">Urut A sampai Z</option>
		<option value="short">Terpendek dulu</option>
		<option value="long">Terpanjang dulu</option>
	</select>
	<div class="seg vt" role="group" aria-label="Tampilan">
		<button aria-pressed={prefs.view === 'card'} aria-label="Tampilan kartu" onclick={() => setPrefs({ view: 'card' })}><Icon name="cards" size={17} /></button>
		<button aria-pressed={prefs.view === 'list'} aria-label="Tampilan daftar" onclick={() => setPrefs({ view: 'list' })}><Icon name="list" size={17} /></button>
	</div>
</div>

<div class="label count">{results.length} doa</div>

{#if !results.length}
	<p class="empty">
		{filter === 'Favorit' && !q ? 'Belum ada favorit. Ketuk ikon hati di doa yang sering kamu baca.' : 'Belum ada doa yang cocok. Coba kata lain atau pilih Semua.'}
	</p>
{:else if prefs.view === 'card'}
	{#each results as d, i (d.id)}
		<a class="card dcard" href="/doa/{d.slug}" style:animation-delay="{Math.min(i, 8) * 45}ms">
			<div class="head">
				<StarNum n={d.id} />
				<span class="label grow">{d.category}</span>
				<button class="fav" class:on={favs.has(d.id)} aria-label="Favorit" aria-pressed={favs.has(d.id)} onclick={(e) => fav(e, d.id)}>
					<Icon name="heart" />
				</button>
			</div>
			<p class="ar">{d.arabic}</p>
			<h2 class="t disp">{d.title}</h2>
			<div class="meta">
				<span class:warn={d.warn}>{d.source}</span>
				<span class="dot"></span><span class="num">{d.wordCount} kata</span>
				{#if readToday.has(d.id)}<span class="dot"></span><span class="read">Dibaca</span>{/if}
			</div>
		</a>
	{/each}
{:else}
	<div class="card rows">
		{#each results as d, i (d.id)}
			<a class="drow" href="/doa/{d.slug}" style:animation-delay="{Math.min(i, 10) * 30}ms">
				<StarNum n={d.id} />
				<div class="grow min">
					<p class="t">{d.title}</p>
					<div class="meta"><span>{d.category}</span><span class="dot"></span><span class="ell" class:warn={d.warn}>{d.source}</span></div>
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
	.chips {
		display: flex;
		gap: 7px;
		overflow-x: auto;
		margin: 12px -18px 0;
		padding: 2px 18px 4px;
		scrollbar-width: none;
	}
	.chips::-webkit-scrollbar {
		display: none;
	}
	.chip {
		flex: none;
		height: 34px;
		padding: 0 14px;
		border-radius: 999px;
		font-size: 12.5px;
		font-weight: 700;
		color: var(--ink2);
		border: 1px solid var(--line-strong);
		transition: all 0.25s var(--ease);
	}
	.chip[aria-pressed='true'] {
		background: var(--ink);
		color: var(--paper);
		border-color: var(--ink);
	}
	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 14px 2px 10px;
	}
	select {
		font: inherit;
		font-size: 12px;
		font-weight: 700;
		color: var(--ink);
		background: var(--sunk);
		border: 0;
		border-radius: 10px;
		height: 34px;
		padding: 0 10px;
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
	.warn {
		color: var(--peach-ink);
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
	.salat {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
		margin-bottom: 12px;
		text-decoration: none;
		color: var(--ink3);
	}
	.sico {
		width: 30px;
		height: 34px;
		flex: none;
		border-radius: 50% 50% 6px 6px / 60% 60% 6px 6px;
		background: var(--arch);
		box-shadow: inset 0 -12px 0 var(--cream);
	}
	.sgrow {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}
	.st {
		font-weight: 700;
		font-size: 14px;
		color: var(--ink);
	}
	.ss {
		font-size: 12px;
		color: var(--ink2);
		margin-top: 1px;
	}
</style>
