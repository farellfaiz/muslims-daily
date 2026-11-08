<script lang="ts">
	import CatIcon from '#lib/components/CatIcon.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { SOURCES } from '#lib/data/doa.ts';
	import { doaPrefs } from '#lib/state/app.svelte.ts';

	let { data } = $props();
	const favCount = $derived(doaPrefs.value.favs.length);
</script>

<svelte:head>
	<title>Kumpulan doa · Muslims Daily</title>
	<meta name="description" content="{data.total} doa harian dalam {data.categories.length} kategori, lengkap dengan teks Arab, transliterasi, dan terjemahan." />
</svelte:head>

<header class="page-head">
	<div class="label">Kumpulan doa</div>
	<h1>Doa harian</h1>
</header>

<a class="search press" href="/doa/semua?cari">
	<Icon name="search" />
	<span>Cari di {data.total} doa</span>
</a>

<a class="all press" href="/doa/semua" data-tour="doa">
	<svg class="deco" viewBox="0 0 120 140" aria-hidden="true">
		<path d="M10 140V62C10 32 32 10 60 10s50 22 50 52v78" />
		<path d="M26 140V66c0-20 15-38 34-38s34 18 34 38v74" />
		<circle cx="60" cy="96" r="13" />
	</svg>
	<span class="label">Tanpa kategori</span>
	<span class="big disp num">{data.total}</span>
	<span class="at disp">Semua doa</span>
	<span class="as">Satu daftar utuh, bisa dicari dan diurutkan</span>
	<span class="go"><Icon name="chevron" size={18} stroke={2.2} /></span>
</a>

<div class="duo">
	<a class="card mini press" href="/doa/favorit">
		<span class="mico fav"><Icon name="heart" size={19} /></span>
		<span class="mt">Favorit</span>
		<span class="ms">{favCount ? `${favCount} doa` : 'Belum ada'}</span>
	</a>
	<a class="card mini press" href="/dzikir?set=salat">
		<span class="mico arch" aria-hidden="true"></span>
		<span class="mt">Setelah salat</span>
		<span class="ms">Dzikir &amp; doa</span>
	</a>
</div>

<div class="sec-h">
	<h2>Kategori</h2>
	<span class="label">{data.categories.length} kategori</span>
</div>

<nav class="grid" aria-label="Kategori doa">
	{#each data.categories as c, i (c.slug)}
		<a class="card cat press" class:alt={i % 4 === 1 || i % 4 === 2} href="/doa/{c.slug}" style:animation-delay="{Math.min(i, 12) * 30}ms">
			<span class="cico"><CatIcon slug={c.slug} /></span>
			<span class="ct">{c.short}</span>
			<span class="cs num">{c.count} doa</span>
		</a>
	{/each}
</nav>

<p class="credit">
	Doa dari <a href={SOURCES.nu.url} target="_blank" rel="noopener">{SOURCES.nu.name}</a> dan buku
	<i>Kumpulan Doa Sehari-hari</i> terbitan Kemenag RI. Keterangan sumber tiap doa ada di halaman bacaannya.
</p>

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
		font-size: 14px;
		text-decoration: none;
	}
	.all {
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		margin-top: 12px;
		padding: 18px 20px 20px;
		border-radius: var(--r-lg);
		background: var(--navy);
		color: var(--on-navy);
		text-decoration: none;
		box-shadow: 0 18px 36px -20px var(--frame-shadow);
		animation: rise 0.45s var(--ease) both;
	}
	.all .label {
		color: inherit;
		opacity: 0.7;
	}
	.deco {
		position: absolute;
		right: 18px;
		bottom: -6px;
		width: 104px;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.4;
		opacity: 0.22;
	}
	.deco circle {
		fill: var(--peach-sun);
		stroke: none;
		opacity: 0.9;
	}
	.big {
		font-size: 52px;
		font-weight: 400;
		line-height: 1;
		margin-top: 10px;
		letter-spacing: -0.03em;
	}
	.at {
		font-size: 22px;
		font-weight: 500;
		margin-top: 4px;
	}
	.as {
		font-size: 12.5px;
		opacity: 0.75;
		margin-top: 3px;
		max-width: 62%;
		line-height: 1.45;
	}
	.go {
		position: absolute;
		top: 18px;
		right: 18px;
		width: 34px;
		height: 34px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		background: color-mix(in srgb, currentColor 14%, transparent);
	}
	.duo {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		margin-top: 10px;
	}
	.mini {
		display: grid;
		grid-template-columns: auto 1fr;
		grid-template-rows: auto auto;
		column-gap: 11px;
		align-items: center;
		padding: 12px 12px;
		text-decoration: none;
	}
	.mico {
		grid-row: span 2;
		width: 38px;
		height: 38px;
		border-radius: 13px;
		display: grid;
		place-items: center;
	}
	.mico.fav {
		background: var(--rose-soft);
		color: var(--rose);
	}
	.mico.arch {
		width: 30px;
		height: 36px;
		margin: 0 4px;
		border-radius: 50% 50% 6px 6px / 60% 60% 6px 6px;
		background: var(--arch);
		box-shadow: inset 0 -12px 0 var(--cream);
	}
	.mt {
		font-weight: 700;
		font-size: 13.5px;
		color: var(--ink);
		align-self: end;
	}
	.ms {
		font-size: 11.5px;
		color: var(--ink2);
		font-weight: 600;
		align-self: start;
		margin-top: 1px;
	}
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}
	.cat {
		display: flex;
		flex-direction: column;
		min-height: 118px;
		padding: 14px 14px 13px;
		text-decoration: none;
		animation: rise 0.4s var(--ease) both;
		transition:
			transform 0.25s var(--ease),
			border-color 0.25s;
	}
	.cat:hover {
		transform: translateY(-2px);
		border-color: var(--line-strong);
	}
	.cico {
		width: 40px;
		height: 40px;
		border-radius: 14px;
		display: grid;
		place-items: center;
		background: var(--navy-soft);
		color: var(--navy);
	}
	.alt .cico {
		background: var(--peach-soft);
		color: var(--peach-ink);
	}
	.ct {
		margin-top: auto;
		padding-top: 12px;
		font-family: var(--f-disp);
		font-weight: 500;
		font-size: 16px;
		line-height: 1.2;
		letter-spacing: -0.01em;
		color: var(--ink);
	}
	.cs {
		font-size: 11.5px;
		font-weight: 600;
		color: var(--ink2);
		margin-top: 3px;
	}
	.credit {
		margin: 22px 4px 4px;
		font-size: 12px;
		line-height: 1.6;
		color: var(--ink2);
		text-align: center;
	}
	.credit a {
		color: var(--navy);
		font-weight: 700;
	}
</style>
