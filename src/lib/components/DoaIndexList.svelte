<script lang="ts">
	import { onMount, type ComponentProps } from 'svelte';
	import DoaList from './DoaList.svelte';
	import { loadDoaIndex, type DoaIndex } from '#lib/doaIndex.ts';
	import { tr } from '#lib/i18n.svelte.ts';

	/**
	 * DoaList untuk halaman yang memakai seluruh daftar doa (Semua doa, Favorit, Koleksi).
	 * Datanya satu file bersama (/data/doa-items.json) yang diunduh sekali dan disimpan service worker,
	 * bukan ditanam di HTML tiap halaman.
	 */
	let props: Omit<ComponentProps<typeof DoaList>, 'items' | 'categories'> = $props();

	let index = $state<DoaIndex | null>(null);
	let failed = $state(false);
	function load() {
		failed = false;
		loadDoaIndex().then(
			(d) => (index = d),
			() => (failed = true)
		);
	}
	onMount(load);
</script>

{#if index}
	<DoaList items={index.items} categories={index.categories} {...props} />
{:else if failed}
	<div class="msg">
		<p>{tr('Daftar doa gagal dimuat. Periksa koneksi lalu coba lagi.', 'Could not load the duas. Check your connection and try again.')}</p>
		<button class="press" onclick={load}>{tr('Coba lagi', 'Try again')}</button>
	</div>
{:else}
	<div class="skel" aria-busy="true" aria-label={tr('Memuat doa', 'Loading duas')}>
		{#each { length: 8 } as _, i (i)}<div class="card"></div>{/each}
	</div>
{/if}

<style>
	/* Sama dengan kartu asli (2 kolom, di bawah kolom cari dan toolbar) supaya tidak meloncat saat daftar tampil. */
	.skel {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 10px;
		margin-top: 130px;
	}
	.skel .card {
		height: 118px;
		box-shadow: none;
		background: var(--sunk);
		animation: pulse 1.2s ease-in-out infinite alternate;
	}
	@keyframes pulse {
		to {
			opacity: 0.55;
		}
	}
	.msg {
		margin-top: 24px;
		text-align: center;
		font-size: 14px;
		color: var(--ink2);
	}
	.msg button {
		margin-top: 8px;
		height: 40px;
		padding: 0 18px;
		border-radius: 12px;
		background: var(--navy);
		color: var(--on-navy);
		font-weight: 700;
	}
</style>
