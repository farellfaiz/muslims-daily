<script lang="ts">
	import Flame from '#lib/components/Flame.svelte';
	import Hero from '#lib/components/Hero.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import TodayPrayers from '#lib/components/TodayPrayers.svelte';
	import { doaOfTheDay } from '#lib/data/doa.ts';
	import { formatHijri, formatLong } from '#lib/date.ts';
	import { clock, schedule, settings, tracker } from '#lib/state/app.svelte.ts';
	import { currentStreak } from '#lib/tracker.ts';

	const now = $derived(clock.now);
	const times = $derived(now ? schedule(now) : null);
	const streak = $derived(now ? currentStreak(tracker.value, now) : 0);
	// Tanggal hanya dihitung ulang saat hari berganti, bukan tiap detik.
	const dayStr = $derived(now?.toDateString());
	const greg = $derived(dayStr ? formatLong(new Date(dayStr)) : ' ');
	const hijri = $derived(dayStr ? (formatHijri(new Date(dayStr)) ?? '') : ' ');
	const featured = $derived(doaOfTheDay(dayStr ? new Date(dayStr) : new Date(2026, 0, 1)));
</script>

<svelte:head>
	<title>Muslims Daily</title>
	<meta name="description" content="Jadwal salat, tracker salat, dan kumpulan doa harian. Ringan dan bisa offline." />
</svelte:head>

<header class="top">
	<div class="brand">
		<img src="/icons/icon-192.png" alt="" width="44" height="44" />
		<div>
			<div class="label">{hijri}</div>
			<div class="disp date">{greg}</div>
		</div>
	</div>
	<a class="loc press" href="/lainnya/lokasi"><Icon name="pin" size={15} />{settings.value.label}</a>
</header>

<Hero {now} yesterday={times?.yesterday ?? null} today={times?.today ?? null} tomorrow={times?.tomorrow ?? null} />

<div class="sec-h">
	<h2>Catatan salat</h2>
	<a class="streak press" href="/tracker"><Flame size={15} lit={streak > 0} /><span class="num">{streak}</span> hari istiqamah</a>
</div>
<TodayPrayers {now} today={times?.today ?? null} tomorrow={times?.tomorrow ?? null} />

<div class="sec-h"><h2>Menu</h2></div>
<nav class="quick" aria-label="Menu cepat">
	<a href="/doa" class="press"><span class="ico"><Icon name="bookmark" /></span>Doa</a>
	<a href="/dzikir" class="press"><span class="ico"><Icon name="beads" /></span>Dzikir</a>
	<a href="/quran" class="press"><span class="ico"><Icon name="book" /></span>Al-Qur'an</a>
	<a href="/kiblat" class="press"><span class="ico"><Icon name="compass" /></span>Kiblat</a>
</nav>

<div class="sec-h"><h2>Doa pilihan</h2><a href="/doa" class="label more">Lihat semua</a></div>
<a class="card feature press" href="/doa/{featured.slug}">
	<div class="label">{featured.category}</div>
	<p class="ar">{featured.arabic}</p>
	<div class="disp ft">{featured.title}</div>
	<p class="tr">{featured.translation}</p>
</a>

<style>
	.top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 10px;
		padding: 22px 2px 18px;
	}
	.brand {
		display: flex;
		gap: 12px;
		align-items: center;
		min-width: 0;
	}
	.brand img {
		border-radius: 13px;
		box-shadow: var(--shadow);
		flex: none;
	}
	.date {
		font-size: clamp(19px, 5.4vw, 22px);
		font-weight: 500;
		margin-top: 2px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.brand > div {
		min-width: 0;
	}
	/* HP sempit: ikon disembunyikan supaya tanggal panjang ("Minggu, 30 September") tidak menabrak lokasi. */
	@media (max-width: 400px) {
		.brand img {
			display: none;
		}
	}
	.loc {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 34px;
		padding: 0 12px;
		border-radius: 999px;
		background: var(--card);
		box-shadow: var(--shadow);
		font-size: 12px;
		font-weight: 700;
		text-decoration: none;
		white-space: nowrap;
		max-width: 46%;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.streak {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 11px;
		border-radius: 999px;
		background: var(--peach-soft);
		color: var(--peach-ink);
		font-size: 12px;
		font-weight: 800;
		text-decoration: none;
	}
	.quick {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 10px;
	}
	.quick a {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 7px;
		font-size: 11.5px;
		font-weight: 700;
		color: var(--ink2);
		text-decoration: none;
	}
	.ico {
		width: 100%;
		aspect-ratio: 1;
		border-radius: 20px;
		display: grid;
		place-items: center;
		background: var(--card);
		box-shadow: var(--shadow);
		border: 1px solid var(--line);
		color: var(--navy);
	}
	.more {
		color: var(--navy);
		text-decoration: none;
	}
	.feature {
		display: block;
		position: relative;
		overflow: hidden;
		padding: 18px;
		text-decoration: none;
	}
	.feature::before {
		content: '';
		position: absolute;
		right: -30px;
		top: -30px;
		width: 120px;
		height: 120px;
		opacity: 0.6;
		background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cg fill='none' stroke='%23E59B78' stroke-width='.8'%3E%3Crect x='25' y='25' width='50' height='50'/%3E%3Crect x='25' y='25' width='50' height='50' transform='rotate(45 50 50)'/%3E%3Ccircle cx='50' cy='50' r='16'/%3E%3C/g%3E%3C/svg%3E")
			center/contain no-repeat;
	}
	.feature > * {
		position: relative;
	}
	.feature .ar {
		font-size: 26px;
		margin: 8px 0 4px;
	}
	.ft {
		font-size: 17px;
		font-weight: 500;
	}
	.tr {
		font-size: 13px;
		color: var(--ink2);
		margin: 4px 0 0;
		line-height: 1.55;
	}
</style>
