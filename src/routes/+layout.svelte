<script lang="ts">
	import '@fontsource-variable/fraunces/opsz.css';
	import '@fontsource-variable/plus-jakarta-sans';
	import '@fontsource/amiri/arabic-400.css';
	import '@fontsource/amiri/arabic-700.css';
	import '../app.css';

	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import { pwaInfo } from 'virtual:pwa-info';
	import BottomNav from '#lib/components/BottomNav.svelte';
	import InstallSheet from '#lib/components/InstallSheet.svelte';
	import Toast from '#lib/components/Toast.svelte';
	import { clock, theme } from '#lib/state/app.svelte.ts';
	import { install } from '#lib/state/install.svelte.ts';
	import { adzan } from '#lib/state/adzan.svelte.ts';
	import { quiet } from '#lib/transition.ts';

	let { children } = $props();

	onMount(() => {
		const stop = clock.start();
		const stopInstall = install.start();
		const stopAdzan = adzan.start();
		// Service worker: aplikasi tersimpan untuk offline dan memperbarui diri diam-diam.
		import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true }));
		return () => {
			stop();
			stopInstall();
			stopAdzan();
		};
	});

	// Tema: atribut data-theme di <html> + warna bilah status mengikuti latar halaman.
	$effect(() => {
		const mode = theme.value.mode;
		const root = document.documentElement;
		if (mode === 'system') delete root.dataset.theme;
		else root.dataset.theme = mode;
		const media = matchMedia('(prefers-color-scheme: dark)');
		const paint = () => {
			const meta = document.querySelector('meta[name="theme-color"]');
			meta?.setAttribute('content', getComputedStyle(root).getPropertyValue('--paper').trim() || '#FAF6F1');
		};
		paint();
		media.addEventListener('change', paint);
		return () => media.removeEventListener('change', paint);
	});

	// Transisi halus antarhalaman (didukung Chrome/Edge/Safari terbaru; browser lain langsung pindah).
	onNavigate((nav) => {
		if (!document.startViewTransition || nav.from?.url.pathname === nav.to?.url.pathname) return;
		return new Promise((resolve) => {
			// Pengaman: bila frame tidak segera digambar, navigasi tetap jalan tanpa animasi.
			const timer = setTimeout(resolve, 250);
			quiet(
				document.startViewTransition(async () => {
					clearTimeout(timer);
					resolve();
					await nav.complete;
				})
			);
		});
	});
</script>

<svelte:head>
	{#if pwaInfo}
		{@html pwaInfo.webManifest.linkTag}
	{/if}
</svelte:head>

<div class="app">
	<main>{@render children()}</main>
</div>
<BottomNav />
<InstallSheet />
<Toast />

<style>
	.app {
		position: relative;
		width: 100%;
		max-width: 430px;
		min-height: 100dvh;
		margin: 0 auto;
		background: var(--paper);
		padding: 0 18px calc(var(--nav-h) + 40px + var(--safe-b));
		overflow-x: clip;
	}
	@media (min-width: 520px) {
		.app {
			box-shadow:
				0 0 0 1px var(--line),
				0 30px 80px -30px var(--frame-shadow);
		}
	}
</style>
