<script lang="ts">
	import { APP_URL, REPO_URL } from '#lib/config.ts';
	import { tr } from '#lib/i18n.svelte.ts';
	import Icon from './Icon.svelte';

	// Kredit tampil di pop up, sama seperti halaman Lainnya di aplikasinya.
	const CREDITS: [string, string, string, string?][] = $derived([
		['Pillars', 'Prayer Times & Qibla', tr('Desain aplikasi ini terinspirasi darinya.', "This app's design was inspired by it.")],
		[
			'NU Online',
			'quran.nu.or.id/doa',
			tr('Sumber kumpulan doa: teks Arab, transliterasi, terjemahan, dan keterangannya.', 'Source of the dua collection: Arabic text, transliteration, translation, and notes.'),
			'https://quran.nu.or.id/doa'
		],
		[
			'Hisnul Muslim',
			tr('Edisi Indonesia', 'Indonesian edition'),
			tr('Terjemahan dzikir pagi petang (alih bahasa H. Mahrus Ali). Teks Arab dari hisnmuslim.com.', 'Morning and evening dhikr translation (by H. Mahrus Ali). Arabic text from hisnmuslim.com.')
		],
		[
			'NU Online · Wirdul Lathif',
			'quran.nu.or.id/wirid',
			tr('Versi kedua dzikir pagi petang.', 'Second version of the morning and evening dhikr.'),
			'https://quran.nu.or.id/wirid'
		],
		['adhan', tr('Library perhitungan', 'Calculation library'), tr('Menghitung jadwal salat dan arah kiblat.', 'Calculates prayer times and qibla direction.'), 'https://github.com/batoulapps/adhan-js'],
		['quran.com', tr("Teks Al-Qur'an", "Qur'an text"), tr('Teks Utsmani, transliterasi, dan arti per kata.', 'Uthmani text, transliteration, and word-by-word meanings.'), 'https://quran.com'],
		[
			'Kementerian Agama RI',
			tr('Terjemahan & doa', 'Translations & duas'),
			tr("Terjemahan ayat Al-Qur'an, dan doa tambahan dari buku Kumpulan Doa Sehari-hari (2013).", "Qur'an translation, plus extra duas from the book Kumpulan Doa Sehari-hari (2013).")
		]
	]);

	let dlg = $state<HTMLDialogElement>();
</script>

<footer>
	<div class="wrap row">
		<div class="brand">
			<img src="/icons/icon-192.png" alt="" width="36" height="36" />
			<div>
				<b class="disp">Muslims Daily</b>
				<p>{tr('Open source, lisensi MIT.', 'Open source, MIT license.')}</p>
			</div>
		</div>
		<nav aria-label={tr('Tautan footer', 'Footer links')}>
			<a href={APP_URL}>App</a>
			<a href="#privasi">{tr('Privasi', 'Privacy')}</a>
			<a href="#install">Install</a>
			<a href={REPO_URL}>GitHub</a>
			<button type="button" onclick={() => dlg?.showModal()}>{tr('Kredit', 'Credits')}</button>
		</nav>
	</div>
</footer>

<dialog bind:this={dlg} aria-labelledby="credits-h" onclick={(e) => e.target === dlg && dlg?.close()}>
	<div class="sheet">
		<header>
			<h2 id="credits-h" class="disp">{tr('Kredit', 'Credits')}</h2>
			<button type="button" class="x" aria-label={tr('Tutup', 'Close')} onclick={() => dlg?.close()}>
				<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17" /></svg>
			</button>
		</header>
		<ul>
			{#each CREDITS as [name, sub, text, href] (name)}
				<li>
					<div class="top">
						{#if href}<a {href} target="_blank" rel="noopener">{name}</a>{:else}<b>{name}</b>{/if}
						<span>{sub}</span>
					</div>
					<p>{text}</p>
				</li>
			{/each}
		</ul>
		<a class="repo" href={REPO_URL}><Icon name="github" size={16} /> {tr('Lihat repo di GitHub', 'See the repo on GitHub')}</a>
	</div>
</dialog>

<style>
	footer {
		padding: 40px 0;
		background: var(--paper);
		border-top: 1px solid var(--line);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 24px;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.brand img {
		border-radius: 10px;
	}
	.brand b {
		font-size: 19px;
	}
	.brand p {
		margin: 2px 0 0;
		font-size: 13.5px;
		color: var(--ink2);
	}
	nav {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 22px;
	}
	nav a,
	nav button {
		font-size: 14px;
		font-weight: 700;
		text-decoration: none;
		color: var(--ink2);
	}
	nav a:hover,
	nav button:hover {
		color: var(--ink);
	}

	@media (max-width: 899px) {
		.row {
			flex-direction: column;
			text-align: center;
		}
		.brand {
			flex-direction: column;
			gap: 10px;
		}
		nav {
			justify-content: center;
		}
	}

	dialog {
		width: min(460px, calc(100vw - 32px));
		max-height: min(640px, calc(100dvh - 48px));
		padding: 0;
		border: 0;
		border-radius: var(--r-lg);
		background: var(--card);
		color: var(--ink);
		box-shadow: var(--shadow-lg);
	}
	dialog::backdrop {
		background: rgba(15, 26, 38, 0.45);
		backdrop-filter: blur(4px);
	}
	dialog[open] {
		animation: pop 0.3s var(--ease);
	}
	@keyframes pop {
		from {
			opacity: 0;
			transform: translateY(12px) scale(0.98);
		}
	}
	.sheet {
		padding: 22px 24px 24px;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 6px;
	}
	h2 {
		margin: 0;
		font-size: 26px;
	}
	.x {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--sunk);
	}
	.x svg {
		fill: none;
		stroke: currentColor;
		stroke-width: 1.8;
		stroke-linecap: round;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	li {
		padding: 14px 0;
	}
	li + li {
		border-top: 1px dashed var(--line-strong);
	}
	.top {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 4px 10px;
	}
	.top a,
	.top b {
		font-size: 15.5px;
		font-weight: 700;
		color: var(--ink);
	}
	.top span {
		font-size: 12.5px;
		color: var(--ink2);
	}
	li p {
		margin: 4px 0 0;
		font-size: 14px;
		line-height: 1.55;
		color: var(--ink2);
	}
	.repo {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		margin-top: 10px;
		font-size: 14px;
		font-weight: 700;
		color: var(--navy);
	}
</style>
