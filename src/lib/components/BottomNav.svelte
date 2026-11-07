<script lang="ts">
	import { page } from '$app/state';
	import Icon, { type IconName } from './Icon.svelte';

	const items: { href: string; label: string; icon: IconName }[] = [
		{ href: '/', label: 'Beranda', icon: 'home' },
		{ href: '/tracker', label: 'Tracker', icon: 'grid' },
		{ href: '/doa', label: 'Doa', icon: 'bookmark' },
		{ href: '/lainnya', label: 'Lainnya', icon: 'dots' }
	];

	const active = (href: string) =>
		href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
</script>

<nav aria-label="Navigasi utama">
	{#each items as it (it.href)}
		<a href={it.href} aria-current={active(it.href) ? 'page' : undefined}>
			<Icon name={it.icon} />
			{it.label}
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
		border-radius: 24px;
		background: var(--nav-bg);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		padding: 6px;
		box-shadow: 0 18px 40px -16px var(--nav-shadow);
		view-transition-name: bottom-nav;
	}
	a {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		border-radius: 18px;
		font-size: 10.5px;
		font-weight: 700;
		text-decoration: none;
		color: var(--nav-ink);
		transition:
			background 0.3s var(--ease),
			color 0.3s var(--ease);
	}
	a[aria-current='page'] {
		color: var(--ink);
		background: var(--nav-active);
	}
</style>
