<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import StarNum from '#lib/components/StarNum.svelte';
	import { searchSurat } from '#lib/quran.ts';
	import { quranLast } from '#lib/state/app.svelte.ts';

	let { data } = $props();

	let query = $state('');
	const shown = $derived(searchSurat(data.surat, query));
	const last = $derived(quranLast.value.s ? data.surat[quranLast.value.s - 1] : null);
</script>

<svelte:head>
	<title>Al-Qur'an · Muslims Daily</title>
	<meta name="description" content="Al-Qur'an 114 surat dengan terjemahan Kemenag, transliterasi, dan arti per kata. Bisa dibaca tanpa internet." />
</svelte:head>

<header class="page-head">
	<div class="label">114 surat</div>
	<h1>Al-Qur'an</h1>
</header>

{#if last}
	<a class="card resume press" href="/quran/{last.n}#a{quranLast.value.a}">
		<span class="ico"><Icon name="book" size={20} /></span>
		<span class="grow">
			<span class="label">Lanjutkan membaca</span>
			<span class="rt">{last.nama} <span class="num">· ayat {quranLast.value.a}</span></span>
		</span>
		<Icon name="chevron" size={16} stroke={2.2} />
	</a>
{/if}

<label class="card search">
	<Icon name="search" size={18} />
	<input
		bind:value={query}
		type="search"
		placeholder="Cari surat: yasin, kahfi, 36"
		aria-label="Cari surat"
		autocomplete="off"
		spellcheck="false"
	/>
</label>

<nav class="card list" aria-label="Daftar surat">
	{#each shown as s (s.n)}
		<a class="row" href="/quran/{s.n}">
			<StarNum n={s.n} />
			<span class="grow">
				<span class="rt">{s.nama}</span>
				<span class="rs">{s.arti} · <span class="num">{s.ayat}</span> ayat · {s.tempat}</span>
			</span>
			<span class="ar" lang="ar">{s.arab}</span>
		</a>
	{:else}
		<p class="empty">Tidak ada surat yang cocok dengan “{query}”.</p>
	{/each}
</nav>

<p class="credit">
	Teks Utsmani dan arti per kata dari quran.com. Terjemahan ayat dari Kementerian Agama RI.
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
