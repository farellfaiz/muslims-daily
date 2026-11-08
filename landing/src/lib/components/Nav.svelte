<script lang="ts">
	import { onMount } from 'svelte';
	import { APP_URL, REPO_URL } from '#lib/config.ts';
	import { isEn, toggleLang, tr } from '#lib/i18n.svelte.ts';
	import { onFrame } from '#lib/scroll.ts';
	import Icon from './Icon.svelte';

	let scrolled = $state(false);
	let dark = $state(false);

	onMount(() => {
		dark = document.documentElement.dataset.theme === 'dark';
		return onFrame(() => {
			const s = scrollY > 8;
			if (s !== scrolled) scrolled = s;
		});
	});

	function toggleTheme() {
		dark = !dark;
		const root = document.documentElement;
		root.dataset.theme = dark ? 'dark' : 'light';
		document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0A121B' : '#D3E4F3');
		try {
			localStorage.setItem('mdl:theme', dark ? 'dark' : 'light');
		} catch {
			/* storage diblokir: tema tetap berlaku selama halaman terbuka */
		}
	}
</script>

<nav class:scrolled aria-label={tr('Navigasi utama', 'Main navigation')}>
	<div class="bar">
		<a class="brand" href="/" aria-label={tr('Muslims Daily, ke atas', 'Muslims Daily, back to top')}>
			<img src="/icons/icon-192.png" alt="" width="34" height="34" />
			<span class="disp">Muslims Daily</span>
		</a>
		<div class="links">
			<a href="#fitur">{tr('Fitur', 'Features')}</a>
			<a href="#privasi">{tr('Privasi', 'Privacy')}</a>
			<a href="#install">Install</a>
			<a href={REPO_URL}>GitHub</a>
		</div>
		<div class="actions">
			<!-- Seperti tombol tema: yang tampil adalah tujuan gantinya. -->
			<button class="round lang" onclick={toggleLang} aria-label={tr('Switch to English', 'Ganti ke Bahasa Indonesia')}>
				{isEn() ? 'ID' : 'EN'}
			</button>
			<button
				class="round"
				onclick={toggleTheme}
				aria-label={dark ? tr('Ganti ke light mode', 'Switch to light mode') : tr('Ganti ke dark mode', 'Switch to dark mode')}
			>
				<Icon name={dark ? 'sun' : 'moon'} size={18} />
			</button>
			<a class="go" href={APP_URL}><span class="long">{tr('Buka aplikasi', 'Open app')}</span><span class="short">{tr('Buka app', 'Open app')}</span></a>
		</div>
	</div>
</nav>

<style>
	/* Pil mengambang seperti nav bawah aplikasinya: menyatu di atas langit apa pun. */
	nav {
		position: fixed;
		z-index: 50;
		top: 10px;
		left: 0;
		right: 0;
		padding: 0 calc(var(--gutter) - 6px);
		pointer-events: none;
	}
	.bar {
		pointer-events: auto;
		height: 56px;
		max-width: calc(var(--wrap) + 28px);
		margin: 0 auto;
		padding: 0 8px 0 12px;
		border-radius: 999px;
		display: flex;
		align-items: center;
		gap: 12px;
		transition:
			background 0.35s var(--ease),
			box-shadow 0.35s var(--ease);
	}
	nav.scrolled .bar {
		background: var(--paper-glass);
		-webkit-backdrop-filter: blur(18px) saturate(170%);
		backdrop-filter: blur(18px) saturate(170%);
		box-shadow:
			inset 0 0 0 1px var(--line),
			0 16px 36px -20px rgba(15, 26, 38, 0.5);
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		margin-right: auto;
	}
	.brand img {
		border-radius: 10px;
		box-shadow: var(--shadow);
	}
	.brand span {
		font-size: 19px;
		white-space: nowrap;
	}
	.links {
		display: none;
		gap: 4px;
	}
	.links a {
		padding: 8px 12px;
		border-radius: 999px;
		font-size: 14px;
		font-weight: 700;
		text-decoration: none;
		color: var(--ink);
		transition:
			color 0.2s,
			background 0.2s;
	}
	.links a:hover {
		color: var(--ink);
		background: var(--line);
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.round {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		color: var(--ink);
		background: var(--card);
		box-shadow: var(--shadow);
	}
	.lang {
		font-size: 12.5px;
		font-weight: 800;
		letter-spacing: 0.02em;
	}
	.go {
		display: inline-flex;
		align-items: center;
		height: 40px;
		padding: 0 16px;
		border-radius: 999px;
		background: var(--navy);
		color: var(--on-navy);
		font-size: 14px;
		font-weight: 700;
		text-decoration: none;
		white-space: nowrap;
	}
	.go .short {
		display: none;
	}
	@media (max-width: 520px) {
		.go .long {
			display: none;
		}
		.go .short {
			display: inline;
		}
	}
	/* Tanpa blur di HP: nav menempel di atas adegan yang terus bergerak, dan blur dihitung ulang tiap frame. */
	@media (max-width: 899px) {
		nav.scrolled .bar {
			background: var(--paper);
			-webkit-backdrop-filter: none;
			backdrop-filter: none;
		}
	}
	/* Tiga kontrol plus nama aplikasi: di HP kecil dirapatkan, di yang paling sempit cukup ikonnya. */
	@media (max-width: 430px) {
		.actions {
			gap: 6px;
		}
		.round {
			width: 36px;
			height: 36px;
		}
		.brand span {
			font-size: 17px;
		}
	}
	@media (max-width: 386px) {
		.brand span {
			display: none;
		}
	}
	@media (min-width: 960px) {
		.links {
			display: flex;
		}
	}
</style>
