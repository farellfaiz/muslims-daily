<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import StarNum from '#lib/components/StarNum.svelte';
	import { TEMPAT_EN, parseJump, searchSurat, type Surat } from '#lib/quran.ts';
	import { quranLast } from '#lib/state/app.svelte.ts';
	import { tr } from '#lib/i18n.svelte.ts';

	const place = (t: Surat['tempat']) => tr(t, TEMPAT_EN[t]);

	let { data } = $props();

	let query = $state('');
	let tab = $state<'surat' | 'juz'>('surat');
	const searching = $derived(query.trim() !== '');
	const shown = $derived(searchSurat(data.surat, query));
	// "2:255" atau "baqarah 255": tawarkan langsung membuka ayatnya
	const jump = $derived(parseJump(data.surat, query));
	const last = $derived(quranLast.value.s ? data.surat[quranLast.value.s - 1] : null);
</script>

<svelte:head>
	<title>{tr("Al-Qur'an", 'Quran')} · Muslims Daily</title>
	<meta
		name="description"
		content={tr(
			"Al-Qur'an 114 surat dengan terjemahan Kemenag, transliterasi, dan arti per kata. Bisa dibaca tanpa internet.",
			'All 114 surahs of the Quran with Indonesian translation (Kemenag), transliteration, and word-by-word meanings. Works offline.'
		)}
	/>
</svelte:head>

<header class="page-head">
	<div class="label">{tr('114 surat', '114 surahs')}</div>
	<h1>{tr("Al-Qur'an", 'Quran')}</h1>
</header>

{#if last}
	<a class="card resume press" href="/quran/{last.n}#a{quranLast.value.a}">
		<span class="ico"><Icon name="book" size={20} /></span>
		<span class="grow">
			<span class="label">{tr('Lanjutkan membaca', 'Continue reading')}</span>
			<span class="rt">{last.nama} <span class="num">· {tr('ayat', 'verse')} {quranLast.value.a}</span></span>
		</span>
		<Icon name="chevron" size={16} stroke={2.2} />
	</a>
{/if}

<label class="card search">
	<Icon name="search" size={18} />
	<input
		bind:value={query}
		type="search"
		placeholder={tr('Cari surat atau ayat: yasin, 2:255', 'Search a surah or verse: yasin, 2:255')}
		aria-label={tr('Cari surat', 'Search surahs')}
		autocomplete="off"
		spellcheck="false"
	/>
</label>

{#if jump}
	<a class="card jump press" href="/quran/{jump.surat.n}#a{jump.ayat}">
		<span class="label">{tr('Buka ayat', 'Go to verse')}</span>
		<span class="rt">{jump.surat.nama} <span class="num">{tr('ayat', 'verse')} {jump.ayat}</span></span>
		<Icon name="chevron" size={16} stroke={2.2} />
	</a>
{/if}

{#if !searching}
	<div class="seg wide" role="group" aria-label={tr('Tampilkan per', 'Show by')}>
		<button aria-pressed={tab === 'surat'} onclick={() => (tab = 'surat')}>{tr('Surat', 'Surah')}</button>
		<button aria-pressed={tab === 'juz'} onclick={() => (tab = 'juz')}>Juz</button>
	</div>
{/if}

{#if tab === 'juz' && !searching}
	{#each data.juz as z (z.j)}
		{@const [fs, fa] = z.s[0]}
		{@const [ls, , lb] = z.s[z.s.length - 1]}
		<section class="jz" aria-labelledby="juz-{z.j}">
			<h2 class="jh" id="juz-{z.j}">
				Juz <span class="num">{z.j}</span>
				<span class="jr">{data.surat[fs - 1].nama} <span class="num">{fa}</span> – {data.surat[ls - 1].nama} <span class="num">{lb}</span></span>
			</h2>
			<nav class="card list">
				{#each z.s as [n, a, b] (n)}
					{@const su = data.surat[n - 1]}
					<a class="row" href="/quran/{n}#a{a}">
						<StarNum {n} />
						<span class="grow">
							<span class="rt">{su.nama}</span>
							<span class="rs">
								{#if a === 1 && b === su.ayat}{tr('Satu surat,', 'Whole surah,')} <span class="num">{su.ayat}</span>
									{tr('ayat', 'verses')}
								{:else}{tr('Ayat', 'Verses')} <span class="num">{a}–{b}</span>{/if}
							</span>
						</span>
						<span class="ar" lang="ar">{su.arab}</span>
					</a>
				{/each}
			</nav>
		</section>
	{/each}
{:else}
	<nav class="card list" aria-label={tr('Daftar surat', 'Surah list')}>
		{#each shown as s (s.n)}
			<a class="row" href="/quran/{s.n}">
				<StarNum n={s.n} />
				<span class="grow">
					<span class="rt">{s.nama}</span>
					<span class="rs">{s.arti} · <span class="num">{s.ayat}</span> {tr('ayat', 'verses')} · {place(s.tempat)}</span>
				</span>
				<span class="ar" lang="ar">{s.arab}</span>
			</a>
		{:else}
			{#if !jump}<p class="empty">{tr(`Tidak ada surat yang cocok dengan “${query}”.`, `No surah matches “${query}”.`)}</p>{/if}
		{/each}
	</nav>
{/if}

<p class="credit">
	{tr(
		'Teks Utsmani dan arti per kata dari quran.com. Terjemahan ayat dari Kementerian Agama RI.',
		'Uthmani text and word-by-word meanings from quran.com. Verse translations from the Indonesian Ministry of Religious Affairs.'
	)}
</p>

<style>
	.resume {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		margin-bottom: 12px;
		color: var(--ink3);
		text-decoration: none;
	}
	.ico {
		width: 40px;
		height: 40px;
		flex: none;
		border-radius: 12px;
		display: grid;
		place-items: center;
		background: var(--navy);
		color: var(--on-navy);
	}
	.grow {
		flex: 1;
		min-width: 0;
	}
	.grow .label {
		display: block;
	}
	.rt {
		display: block;
		margin-top: 2px;
		font-weight: 700;
		font-size: 14.5px;
		color: var(--ink);
	}
	.rt .num {
		font-weight: 600;
		color: var(--ink2);
	}
	.search {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 0 14px;
		height: 48px;
		margin-bottom: 12px;
		color: var(--ink3);
	}
	.search input {
		flex: 1;
		min-width: 0;
		border: 0;
		outline: 0;
		background: none;
		font: inherit;
		font-size: 16px;
		color: var(--ink);
	}
	.list {
		padding: 4px 0;
	}
	.list:empty {
		display: none;
	}
	.jump {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 14px 16px;
		margin-bottom: 12px;
		color: var(--navy);
		text-decoration: none;
		box-shadow:
			0 0 0 1.5px var(--navy),
			var(--shadow);
	}
	.jump .rt {
		flex: 1;
		margin: 0;
	}
	.wide {
		display: flex;
		width: 100%;
		margin-bottom: 12px;
	}
	.wide button {
		flex: 1;
	}
	.jz {
		content-visibility: auto;
		contain-intrinsic-size: auto 260px;
	}
	.jh {
		display: flex;
		align-items: baseline;
		gap: 6px;
		margin: 18px 2px 10px;
		font-family: var(--f-disp);
		font-weight: 500;
		font-size: 19px;
		letter-spacing: -0.01em;
	}
	.wide + .jz .jh {
		margin-top: 4px;
	}
	.jr {
		margin-left: auto;
		font-family: var(--f-body);
		font-size: 11.5px;
		font-weight: 600;
		letter-spacing: 0;
		color: var(--ink3);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 11px 16px;
		color: inherit;
		text-decoration: none;
		border-top: 1px solid var(--line);
		/* 114 baris: yang di luar layar tidak dirender sampai digulir */
		content-visibility: auto;
		contain-intrinsic-size: auto 62px;
	}
	.row:first-child {
		border-top: 0;
	}
	.row:active {
		background: var(--sunk);
	}
	.rs {
		display: block;
		margin-top: 2px;
		font-size: 12px;
		color: var(--ink2);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ar {
		flex: none;
		font-family: var(--f-ar);
		font-size: 20px;
		color: var(--navy);
	}
	.empty {
		margin: 0;
		padding: 18px 16px;
		font-size: 13px;
		color: var(--ink3);
		text-align: center;
	}
	.credit {
		margin: 14px 4px 0;
		font-size: 11.5px;
		line-height: 1.5;
		color: var(--ink3);
		text-align: center;
	}
</style>
