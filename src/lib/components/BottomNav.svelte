<script lang="ts">
	import { navigating, page } from '$app/state';
	import Icon, { type IconName } from './Icon.svelte';
	import { tr } from '#lib/i18n.svelte.ts';

	// $derived supaya label ikut berganti saat bahasa diubah
	const items: { href: string; label: string; icon: IconName }[] = $derived([
		{ href: '/', label: tr('Beranda', 'Home'), icon: 'home' },
		{ href: '/tracker', label: 'Tracker', icon: 'grid' },
		{ href: '/quran', label: 'Quran', icon: 'book' },
		{ href: '/doa', label: tr('Doa', 'Duas'), icon: 'bookmark' },
		{ href: '/lainnya', label: tr('Lainnya', 'More'), icon: 'dots' }
	]);

	// Pakai tujuan navigasi selagi halaman dimuat, supaya pil langsung bergerak saat tab diketuk.
	const path = $derived(navigating.to?.url.pathname ?? page.url.pathname);
	const active = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));
</script>

<!--
	Pil melebar: hanya tab aktif yang menampilkan label. Tab lain cukup ikon,
	jadi lima tab tetap lega. Label tab nonaktif disembunyikan secara visual saja
	(lebar 0), sehingga pembaca layar tetap membacanya sebagai nama tautan.
-->
<nav aria-label={tr('Navigasi utama', 'Main navigation')} data-tour="nav">
	{#each items as it (it.href)}
		<a href={it.href} aria-current={active(it.href) ? 'page' : undefined}>
			<Icon name={it.icon} />
			<span class="txt">{it.label}</span>
		</a>
	{/each}
</nav>

<style>
	nav {
		position: fixed;
		z-index: 20;
		left: 50%;
		bottom: calc(14px + var(--safe-b));
		transform: translateX(-50%);
		width: calc(min(430px, 100%) - 28px);
		height: var(--nav-h);
		border-radius: 999px;
		background: var(--nav-bg);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		display: flex;
		gap: 2px;
		padding: 7px;
		box-shadow: 0 18px 40px -16px var(--nav-shadow);
		view-transition-name: bottom-nav;
	}
	a {
		flex: 1 1 0;
		min-width: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 999px;
		font-size: 12.5px;
		font-weight: 700;
		text-decoration: none;
		color: var(--nav-ink);
		overflow: hidden;
		transition:
			flex-grow 0.45s var(--ease),
			background 0.3s var(--ease),
			color 0.3s var(--ease);
	}
	a[aria-current='page'] {
		flex-grow: 2.4;
		color: var(--ink);
		background: var(--nav-active);
	}
	.txt {
		max-width: 0;
		opacity: 0;
		overflow: hidden;
		white-space: nowrap;
		transition:
			max-width 0.45s var(--ease),
			margin 0.45s var(--ease),
			opacity 0.2s var(--ease);
	}
	a[aria-current='page'] .txt {
		max-width: 90px;
		margin-left: 7px;
		opacity: 1;
		transition-delay: 0s, 0s, 0.12s;
	}
</style>
