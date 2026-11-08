<script lang="ts">
	import { reveal } from '#lib/scroll.ts';
	import data from '#lib/screens.json';
	import Icon from './Icon.svelte';
	import Phone, { type Shot } from './Phone.svelte';

	const shot = (id: string) => data.screens.find((s) => s.id === id) as Shot;

	const SHOWCASE = [
		{
			shot: shot('kiblat'),
			title: 'Kompas kiblat',
			text: 'Piringannya ikut berputar waktu HP digerakkan. Begitu pas menghadap kiblat, bingkainya menyala dan HP bergetar sebentar.'
		},
		{
			shot: shot('koreksi'),
			title: 'Samakan dengan jadwal masjid',
			text: 'Kalau beda sedikit dengan masjid dekat rumah, geser tiap waktu salat per menit. Jarak imsak sebelum Subuh juga bisa diatur.'
		},
		{
			shot: shot('doa-kategori'),
			title: 'Doa per kategori',
			text: 'Dikelompokkan dari doa sehari-hari sampai doa para nabi. Yang sering dibaca bisa disimpan ke favorit.'
		}
	];
	const METHODS = ['Kemenag RI', 'MUIS Singapura', 'Muslim World League', 'Umm al-Qura'];
</script>

<section class="sec more" aria-labelledby="more-h">
	<div class="wrap">
		<div class="sec-head rv" use:reveal>
			<span class="label">Fitur lain</span>
			<h2 class="h2" id="more-h">Fitur kecil yang kepakai tiap hari</h2>
			<p class="lead">
				App ini biasanya dibuka sebentar-sebentar, sering sambil pegang HP satu tangan. Jadi info pentingnya ditaruh paling
				depan.
			</p>
		</div>

		<div class="grid">
			{#each SHOWCASE as c, i (c.shot.id)}
				<article class="card show rv" use:reveal style:--d="{i * 90}ms">
					<h3>{c.title}</h3>
					<p>{c.text}</p>
					<div class="peek">
						<Phone shots={[c.shot]} />
					</div>
				</article>
			{/each}

			<article class="card small rv" use:reveal>
				<span class="ico"><Icon name="clock" size={22} /></span>
				<h3>4 metode perhitungan</h3>
				<ul class="chips">
					{#each METHODS as m (m)}<li>{m}</li>{/each}
				</ul>
				<p>Default-nya Kemenag RI dengan ihtiyat 2 menit. Mazhab Ashar bisa pilih Syafi'i atau Hanafi.</p>
			</article>
			<article class="card small rv" use:reveal style:--d="90ms">
				<span class="ico"><Icon name="wifiOff" size={22} /></span>
				<h3>Tetap jalan pas offline</h3>
				<p>
					Jadwal dihitung langsung di HP, nggak butuh server. Setelah sekali dibuka, jadwal dan doanya tetap bisa dipakai
					tanpa internet.
				</p>
			</article>
			<article class="card small rv" use:reveal style:--d="180ms">
				<span class="ico"><Icon name="bolt" size={22} /></span>
				<h3>Ringan di HP mana pun</h3>
				<p class="stat disp num">&lt;100 KB</p>
				<p>Total JavaScript satu app. Kebuka cepat, termasuk di HP spek standar.</p>
			</article>
		</div>
	</div>
</section>

<style>
	.more {
		background: var(--paper);
	}
	.grid {
		display: grid;
		gap: 16px;
	}
	.card {
		position: relative;
		border-radius: var(--r-lg);
		background: var(--card);
		border: 1px solid var(--line);
		box-shadow: var(--shadow);
		overflow: hidden;
	}
	.card h3 {
		margin: 0;
		font-family: var(--f-disp);
		font-optical-sizing: auto;
		font-weight: 500;
		font-size: clamp(22px, 2vw, 26px);
		line-height: 1.12;
		letter-spacing: -0.02em;
	}
	.card p {
		margin: 10px 0 0;
		font-size: 15px;
		line-height: 1.6;
		color: var(--ink2);
	}
	.show {
		padding: 28px 26px 0;
		display: flex;
		flex-direction: column;
		background: linear-gradient(180deg, var(--card) 0%, var(--card) 45%, var(--sunk) 100%);
	}
	.peek {
		width: min(270px, 74%);
		margin: 30px auto 0;
		height: 330px;
		overflow: hidden;
		padding-top: 4px;
		/* hanya bagian atas HP yang terlihat, seperti mengintip dari bawah kartu */
		mask: linear-gradient(180deg, #000 82%, transparent);
	}
	.peek :global(.phone) {
		transition: transform 0.7s var(--ease);
	}
	.show:hover .peek :global(.phone) {
		transform: translateY(-14px);
	}
	.small {
		padding: 26px 24px 28px;
	}
	.ico {
		display: grid;
		place-items: center;
		width: 46px;
		height: 46px;
		margin-bottom: 18px;
		border-radius: 14px;
		background: var(--navy-soft);
		color: var(--navy);
	}
	.chips {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 14px 0 2px;
		padding: 0;
	}
	.chips li {
		padding: 6px 11px;
		border-radius: 999px;
		background: var(--sunk);
		font-size: 12.5px;
		font-weight: 700;
		color: var(--ink);
	}
	.chips li:first-child {
		background: var(--navy);
		color: var(--on-navy);
	}
	.stat {
		margin: 12px 0 0 !important;
		font-size: 46px !important;
		line-height: 1 !important;
		color: var(--ink) !important;
		letter-spacing: -0.03em;
	}
	@media (min-width: 720px) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (min-width: 1040px) {
		.grid {
			grid-template-columns: repeat(3, 1fr);
		}
		.peek {
			height: 360px;
		}
	}
</style>
