<script lang="ts">
	import { onMount } from 'svelte';
	import { motionOn, onFrame, range, reveal } from '#lib/scroll.ts';
	import Icon, { type IconName } from './Icon.svelte';

	/*
		Malam setelah adegan Journey. Kalimat besar menyala kata demi kata mengikuti gulir,
		lalu bukit krem dan matahari kecil menutup bagian ini seperti fajar hari berikutnya.
	*/
	const WORDS = 'Tanpa akun. Tanpa iklan. Tanpa pelacakan. Catatan ibadahmu hanya tersimpan di HP-mu sendiri.'.split(' ');
	const HOT = new Set([1, 3, 5]);

	const FACTS: { icon: IconName; title: string; text: string }[] = [
		{
			icon: 'pin',
			title: 'Lokasi tidak dikirim',
			text: 'Jadwal dihitung di HP. Lokasi GPS dibulatkan dan tidak dikirim ke mana pun, atau pilih saja dari 24 kota.'
		},
		{
			icon: 'file',
			title: 'Backup satu file',
			text: 'Simpan semua catatan ke file JSON, lalu restore di HP lain tanpa ada centang yang hilang.'
		},
		{
			icon: 'code',
			title: 'Bisa diperiksa',
			text: 'Kodenya terbuka di GitHub. Siapa pun bisa melihat apa saja yang dilakukan aplikasinya.'
		}
	];

	let track = $state<HTMLElement>();
	let para = $state<HTMLElement>();

	onMount(() => {
		if (!motionOn()) return;
		return onFrame(() => {
			if (!track || !para) return;
			const r = track.getBoundingClientRect();
			const h = innerHeight;
			if (r.bottom < 0 || r.top > h) return;
			// Mulai menyala saat kalimat masuk layar, selesai sebelum kalimat dilepas.
			para.style.setProperty('--p', String(range(-r.top, -h * 0.5, r.height - h * 1.15)));
		});
	});
</script>

<section id="privasi" class="privacy">
	<div class="track" bind:this={track}>
		<div class="pin">
			<div class="wrap">
				<p class="label">Privasi</p>
				<h2 class="big disp" bind:this={para} style:--n={WORDS.length}>
					{#each WORDS as w, i (i)}<span class:hot={HOT.has(i)} style:--i={i}>{w}</span>{' '}{/each}
				</h2>
			</div>
		</div>
	</div>
	<div class="wrap">
		<ul class="facts">
			{#each FACTS as f, i (f.title)}
				<li class="rv" use:reveal style:--d="{i * 90}ms">
					<span class="ico"><Icon name={f.icon} size={22} /></span>
					<h3>{f.title}</h3>
					<p>{f.text}</p>
				</li>
			{/each}
		</ul>
	</div>
	<div class="dawn" aria-hidden="true">
		<span class="sun"></span>
		<svg viewBox="0 0 1440 200" preserveAspectRatio="none">
			<path d="M0 200V170C260 80 640 26 1010 22C1200 20 1350 40 1440 62V200Z" />
		</svg>
	</div>
</section>

<style>
	.privacy {
		position: relative;
		color: #e9eef4;
		background:
			radial-gradient(1100px 620px at 85% 70%, rgba(59, 85, 130, 0.32), transparent 62%),
			linear-gradient(180deg, #0f1a26 0%, #101d2c 55%, #13243a 100%);
		padding-bottom: clamp(120px, 16vw, 220px);
		overflow: clip;
	}
	.pin {
		padding: clamp(96px, 12vw, 160px) 0 clamp(40px, 6vw, 80px);
	}
	/* Ruang gulir supaya kalimat sempat menyala sambil tertahan di layar. */
	:global(.motion) .track {
		height: 170vh;
	}
	:global(.motion) .pin {
		position: sticky;
		top: 0;
		height: 100vh;
		display: grid;
		align-items: center;
		padding: var(--nav-h) 0 0;
	}
	.label {
		color: #f1b493;
		margin: 0 0 22px;
	}
	.big {
		margin: 0;
		max-width: 1020px;
		font-size: clamp(38px, 6.2vw, 92px);
		line-height: 1.04;
		letter-spacing: -0.035em;
		text-wrap: balance;
	}
	.big span {
		transition: opacity 0.2s linear;
	}
	.big span.hot {
		color: #f1b493;
	}
	:global(.motion) .big {
		--p: 0;
	}
	:global(.motion) .big span {
		opacity: clamp(0.16, calc(var(--p) * (var(--n) + 3) - var(--i)), 1);
	}
	.facts {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 14px;
	}
	.facts li {
		padding: 26px 24px 28px;
		border-radius: var(--r-lg);
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(190, 212, 236, 0.1);
	}
	.ico {
		display: grid;
		place-items: center;
		width: 46px;
		height: 46px;
		border-radius: 14px;
		background: rgba(157, 193, 231, 0.12);
		color: #9dc1e7;
	}
	.facts h3 {
		margin: 18px 0 8px;
		font-size: 18px;
		font-weight: 700;
	}
	.facts p {
		margin: 0;
		font-size: 15px;
		line-height: 1.6;
		color: #a9b8c8;
	}
	@media (min-width: 820px) {
		.facts {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	.dawn {
		position: absolute;
		left: 0;
		right: 0;
		bottom: -1px;
		height: clamp(90px, 13vw, 190px);
	}
	.dawn svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		fill: var(--paper);
	}
	.dawn .sun {
		position: absolute;
		right: 16%;
		top: 4%;
		width: clamp(56px, 7vw, 96px);
		aspect-ratio: 1;
		border-radius: 50%;
		background: #eda07d;
		box-shadow:
			0 0 0 clamp(12px, 1.6vw, 22px) rgba(237, 160, 125, 0.16),
			0 0 120px 30px rgba(237, 160, 125, 0.22);
	}
</style>
