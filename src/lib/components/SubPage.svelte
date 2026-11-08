<script lang="ts">
	import type { Snippet } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import Icon from './Icon.svelte';

	/** Kerangka layar turunan Lainnya: tombol kembali, judul, lalu isi. */
	let { title, sub, children }: { title: string; sub?: string; children: Snippet } = $props();

	// Kembali ke halaman sebelumnya bila datang dari dalam aplikasi; bila dibuka langsung, ke Lainnya.
	let cameFromApp = $state(false);
	afterNavigate(({ from }) => (cameFromApp = !!from));
	const back = () => (cameFromApp ? history.back() : goto('/lainnya'));
</script>

<svelte:head><title>{title} · Muslims Daily</title></svelte:head>

<div class="bar">
	<button class="back press" aria-label="Kembali" onclick={back}><Icon name="back" /></button>
</div>

<header class="page-head">
	<div class="label">Pengaturan</div>
	<h1>{title}</h1>
	{#if sub}<p class="sub">{sub}</p>{/if}
</header>

{@render children()}

<style>
	.bar {
		padding-top: 18px;
	}
	.back {
		width: 40px;
		height: 40px;
		border-radius: 14px;
		display: grid;
		place-items: center;
		background: var(--card);
		box-shadow: var(--shadow);
		border: 1px solid var(--line);
	}
	.page-head {
		padding-top: 16px;
		padding-bottom: 14px;
	}
	.sub {
		margin: 6px 0 0;
		font-size: 13px;
		line-height: 1.5;
		color: var(--ink2);
	}
</style>
