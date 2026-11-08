<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import { tr } from '#lib/i18n.svelte.ts';

	/**
	 * Lembar bawah (bottom sheet) dengan <dialog> bawaan: Esc, fokus, dan latar gelap sudah ditangani browser.
	 * Buka dan tutup lewat `bind:open`. Ketuk area gelap di luar lembar untuk menutup.
	 */
	let {
		open = $bindable(false),
		title,
		children
	}: { open?: boolean; title: string; children: Snippet } = $props();

	let dlg: HTMLDialogElement | undefined = $state();
	$effect(() => {
		if (!dlg) return;
		if (open && !dlg.open) dlg.showModal();
		else if (!open && dlg.open) dlg.close();
	});
</script>

<dialog
	bind:this={dlg}
	class="sheet"
	aria-label={title}
	onclose={() => (open = false)}
	onclick={(e) => e.target === dlg && (open = false)}
>
	<!-- Judul di luar area gulir: isi yang digulir tidak pernah tergambar di atasnya. -->
	<div class="sheet-h">
		<h2>{title}</h2>
		<button class="x press" aria-label={tr('Tutup', 'Close')} onclick={() => (open = false)}><Icon name="x" size={18} /></button>
	</div>
	<div class="sheet-in">
		{@render children()}
	</div>
</dialog>

<style>
	.sheet {
		margin: auto auto 0;
		width: 100%;
		max-width: 430px;
		max-height: 85dvh;
		padding: 0;
		border: 0;
		border-top: 1px solid var(--line-strong);
		border-radius: var(--r-lg) var(--r-lg) 0 0;
		background: var(--card);
		color: var(--ink);
		box-shadow: 0 -10px 40px -20px var(--frame-shadow);
		overflow: hidden;
	}
	.sheet[open] {
		display: flex;
		flex-direction: column;
		animation: sheet-up 0.32s var(--ease);
	}
	.sheet::backdrop {
		background: rgba(15, 26, 38, 0.45);
		animation: fade 0.25s var(--ease);
	}
	@keyframes sheet-up {
		from {
			transform: translateY(100%);
		}
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.sheet[open],
		.sheet::backdrop {
			animation: none;
		}
	}
	.sheet-h {
		flex: none;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 18px 18px 10px;
		border-bottom: 1px solid var(--line);
	}
	.sheet-in {
		/* Basis harus auto: dengan `flex: 1` (basis 0) Safari menganggap isinya setinggi nol, lembar jadi terpotong. */
		flex: 1 1 auto;
		min-height: 0;
		overflow-y: auto;
		/* gulir berhenti di lembar, tidak ikut menggulir halaman di belakangnya */
		overscroll-behavior: contain;
		padding: 12px 18px calc(22px + var(--safe-b));
	}
	.sheet-h h2 {
		margin: 0;
		font-family: var(--f-disp);
		font-weight: 500;
		font-size: 21px;
		letter-spacing: -0.02em;
	}
	.x {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--sunk);
		color: var(--ink2);
		display: grid;
		place-items: center;
	}
</style>
