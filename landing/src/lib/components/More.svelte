<script lang="ts">
	import { tr } from '#lib/i18n.svelte.ts';
	import { reveal } from '#lib/scroll.ts';
	import data from '#lib/screens.json';
	import Icon from './Icon.svelte';
	import Phone, { type Shot } from './Phone.svelte';

	const shot = (id: string) => data.screens.find((s) => s.id === id) as Shot;

	const SHOWCASE = $derived([
		{
			shot: shot('kiblat'),
			title: tr('Kompas kiblat', 'Qibla compass'),
			text: tr(
				'Piringan ikut arah HP. Bingkai menyala dan HP bergetar saat sudah menghadap kiblat.',
				"The dial follows your phone. The frame lights up and your phone vibrates when you're facing the qibla."
			)
		},
		{
			shot: shot('koreksi'),
			title: tr('Koreksi jadwal', 'Schedule adjustments'),
			text: tr(
				'Geser tiap waktu salat per menit supaya sama dengan masjid terdekat. Imsak juga bisa diatur.',
				'Shift each prayer time by the minute to match your nearest mosque. Imsak is adjustable too.'
			)
		},
		{
			shot: shot('doa-kategori'),
			title: tr('Doa per kategori', 'Duas by category'),
			text: tr(
				'Dari doa sehari-hari sampai doa para nabi. Simpan ke favorit atau koleksi sendiri.',
				'From everyday duas to the duas of the prophets. Save them to favorites or your own collection.'
			)
		}
	]);
	const METHODS = ['Kemenag RI', 'MUIS Singapura', 'Muslim World League', 'Umm al-Qura'];
</script>

<section class="sec more" aria-labelledby="more-h" data-stop>
	<div class="wrap">
		<div class="sec-head rv" use:reveal>
			<h2 class="h2" id="more-h">{tr('Fitur lainnya', 'More features')}</h2>
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
				<h3>{tr('4 metode perhitungan', '4 calculation methods')}</h3>
				<ul class="chips">
					{#each METHODS as m (m)}<li>{m}</li>{/each}
				</ul>
				<p>{tr("Default-nya Kemenag RI dengan ihtiyat 2 menit. Mazhab Ashar bisa pilih Syafi'i atau Hanafi.", "Defaults to Kemenag RI with a 2-minute safety margin. Asr can follow Shafi'i or Hanafi.")}</p>
			</article>
			<article class="card small rv" use:reveal style:--d="90ms">
				<span class="ico"><Icon name="wifiOff" size={22} /></span>
				<h3>{tr('Bisa offline', 'Works offline')}</h3>
				<p>
					{tr(
						'Jadwal dihitung langsung di HP, nggak butuh server. Setelah sekali dibuka, jadwal dan doanya tetap bisa dipakai tanpa internet.',
						'Prayer times are calculated on your phone, no server needed. Open it once and the schedule and duas keep working without internet.'
					)}
				</p>
			</article>
			<article class="card small rv" use:reveal style:--d="180ms">
				<span class="ico"><Icon name="bolt" size={22} /></span>
				<h3>{tr('Ringan', 'Lightweight')}</h3>
				<p class="stat disp num">&lt;100 KB</p>
				<p>{tr('JavaScript per halaman, setelah gzip. Kebuka cepat, termasuk di HP spek standar.', 'JavaScript per page, after gzip. Opens fast, even on a basic phone.')}</p>
			</article>
			<article class="card small rv" use:reveal>
				<span class="ico"><Icon name="bell" size={22} /></span>
				<h3>{tr('Notifikasi adzan', 'Adhan notifications')}</h3>
				<p>
					{tr(
						'Atur per salat, plus pengingat beberapa menit sebelumnya. Aktif selama app masih berjalan. Di iPhone, install dulu ke home screen.',
						'Set them per prayer, with a reminder a few minutes before. Works while the app is running. On iPhone, install it to your home screen first.'
					)}
				</p>
			</article>
			<article class="card small rv" use:reveal style:--d="90ms">
				<span class="ico"><Icon name="globe" size={22} /></span>
				<h3>{tr('Indonesia atau English', 'Indonesian or English')}</h3>
				<p>{tr('Menu dan tampilan bisa diganti ke English. Terjemahan doa tetap bahasa Indonesia.', 'Menus and the interface can switch to English. Dua translations stay in Indonesian.')}</p>
			</article>
			<article class="card small rv" use:reveal style:--d="180ms">
				<span class="ico"><Icon name="moon" size={22} /></span>
				<h3>Dark mode</h3>
				<p>{tr('Terang, gelap, atau ikut pengaturan HP.', 'Light, dark, or follow your phone.')}</p>
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
	/*
		Hanya bagian atas HP yang terlihat, seperti mengintip dari bawah kartu.
		Mask memotong semua yang keluar dari kotak ini, jadi kotaknya diberi ruang di atas dan samping
		untuk gerakan hover, tombol samping HP, dan bayangannya.
	*/
	.peek {
		width: min(calc(min(270px, 74%) + 48px), 100%);
		margin: 6px auto 0;
		height: 358px;
		overflow: hidden;
		padding: 28px 24px 0;
		mask: linear-gradient(180deg, #000 83%, transparent);
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
			height: 388px;
		}
	}
</style>
