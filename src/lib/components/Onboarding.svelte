<script lang="ts">
	import { fade } from 'svelte/transition';
	import { SKY } from './Hero.svelte';
	import Icon, { type IconName } from './Icon.svelte';
	import LocationForm from './LocationForm.svelte';
	import { formatTime, tzLabel } from '#lib/date.ts';
	import { LANGS, lang, placeLabel, prayerName, tr } from '#lib/i18n.svelte.ts';
	import { nextPrayer } from '#lib/prayer.ts';
	import { clock, schedule, settings } from '#lib/state/app.svelte.ts';
	import { tour } from '#lib/state/tour.svelte.ts';

	/**
	 * Perkenalan layar penuh saat aplikasi pertama dibuka: bahasa, isi aplikasi, lokasi, lalu tawaran tour.
	 * Tiap langkah langitnya berganti dan mataharinya berjalan, dari Subuh sampai Maghrib.
	 */
	const SKIES = [SKY.subuh.g, SKY.dzuhur.g, SKY.ashar.g, SKY.maghrib.g];
	// Posisi matahari tiap langkah, dalam persen ukuran matahari dari titik tengahnya.
	const SUN = [
		[-125, 35],
		[-15, -150],
		[95, -80],
		[135, 55]
	];
	const LOCATION_STEP = 2;
	const LAST = SKIES.length - 1;

	let step = $state(0);
	let root = $state<HTMLDivElement>();

	const features: { icon: IconName; title: string; body: string }[] = $derived([
		{
			icon: 'sun',
			title: tr('Jadwal salat', 'Prayer times'),
			body: tr('Hitung mundur ke salat berikutnya, sesuai lokasi kamu.', 'A countdown to the next prayer, based on your location.')
		},
		{
			icon: 'grid',
			title: tr('Tracker salat', 'Prayer tracker'),
			body: tr('Centang salat tiap hari, lihat streak dan heatmap-nya.', 'Tick off each prayer and see your streak and heatmap.')
		},
		{
			icon: 'bookmark',
			title: tr('Doa dan dzikir', 'Duas and dhikr'),
			body: tr('Ratusan doa, plus dzikir pagi petang dan setelah salat.', 'Hundreds of duas, plus morning, evening, and after-prayer dhikr.')
		},
		{
			icon: 'book',
			title: tr("Al-Qur'an dan kiblat", 'Quran and qibla'),
			body: tr('Baca per surat dan cari arah kiblat dari HP.', 'Read surah by surah and find the qibla from your phone.')
		}
	]);

	const next = $derived.by(() => {
		const now = clock.now;
		if (!now) return null;
		const t = schedule(now);
		return { ...nextPrayer(now, t.today, t.tomorrow), tz: tzLabel(now) };
	});

	// Halaman di belakang tidak bisa difokus atau digulir selama onboarding terbuka.
	$effect(() => {
		const behind = document.querySelectorAll<HTMLElement>('.app, [data-tour="nav"]');
		const html = document.documentElement;
		behind.forEach((e) => (e.inert = true));
		html.style.overflow = 'hidden';
		root?.focus({ preventScroll: true });
		return () => {
			behind.forEach((e) => (e.inert = false));
			html.style.overflow = '';
		};
	});
</script>

<div
	class="ob"
	bind:this={root}
	role="dialog"
	aria-modal="true"
	aria-label={tr('Selamat datang', 'Welcome')}
	tabindex="-1"
	style:--sx="{SUN[step][0]}%"
	style:--sy="{SUN[step][1]}%"
	out:fade|global={{ duration: 260 }}
>
	<div class="col">
		<div class="bar">
			{#if step > 0}
				<button class="back press" aria-label={tr('Sebelumnya', 'Previous')} onclick={() => step--}><Icon name="back" size={18} /></button>
			{:else}
				<span></span>
			{/if}
			{#if step < LAST}
				<button class="skip" onclick={() => tour.decline()}>{tr('Lewati', 'Skip')}</button>
			{/if}
		</div>

		<div class="door" class:small={step === LOCATION_STEP} aria-hidden="true">
			<div class="win">
				{#each SKIES as g, i (i)}<i class="sky" class:on={i === step} style:background={g}></i>{/each}
				<div class="sun"></div>
				<div class="hill"></div>
			</div>
		</div>

		<div class="body">
			{#key step}
				<div class="pane">
					{#if step === 0}
						<h1 class="disp">Assalamu'alaikum</h1>
						<p class="lead">{tr('Selamat datang di Muslims Daily, teman ibadah dari Subuh sampai Isya.', 'Welcome to Muslims Daily, your daily Muslim companion from Fajr to Isha.')}</p>
						<div class="langs">
							<div class="seg" role="group" aria-label={tr('Bahasa', 'Language')}>
								{#each LANGS as l (l.code)}
									<button aria-pressed={lang.value.code === l.code} onclick={() => (lang.value = { code: l.code })}>{l.label}</button>
								{/each}
							</div>
						</div>
					{:else if step === 1}
						<h1 class="disp">{tr('Isinya apa aja?', "What's inside")}</h1>
						<ul class="feat">
							{#each features as f (f.icon)}
								<li>
									<span class="fi"><Icon name={f.icon} size={19} /></span>
									<span><b>{f.title}</b><small>{f.body}</small></span>
								</li>
							{/each}
						</ul>
						<p class="note">{tr('Tanpa akun. Semua catatan cuma tersimpan di HP kamu.', 'No account needed. Everything stays on your phone.')}</p>
					{:else if step === LOCATION_STEP}
						<h1 class="disp">{tr('Kamu di mana?', 'Where are you?')}</h1>
						<p class="lead">{tr('Jadwal salat dan arah kiblat dihitung dari sini.', 'Prayer times and the qibla are calculated from here.')}</p>
						<LocationForm />
					{:else}
						<h1 class="disp">{tr('Sudah siap', "You're all set")}</h1>
						{#if next}
							<div class="next card">
								<span class="label">{tr('Salat berikutnya', 'Next prayer')} · {placeLabel(settings.value)}</span>
								<span class="np disp num">{prayerName(next.key)}, {formatTime(next.at)} {next.tz}</span>
							</div>
						{/if}
						<p class="lead">{tr('Mau tour singkat dulu? Cuma sekitar satu menit, dan bisa dibuka lagi dari menu Lainnya.', 'Want a quick tour first? It takes about a minute, and you can reopen it from More.')}</p>
					{/if}
				</div>
			{/key}
		</div>

		<div class="foot">
			{#if step < LAST}
				<div class="dots" aria-hidden="true">
					{#each SKIES as _, i (i)}<span class:on={i === step}></span>{/each}
				</div>
				<button class="go press" onclick={() => step++}>{tr('Lanjut', 'Next')}</button>
			{:else}
				<button class="go wide press" onclick={() => tour.start()}>{tr('Mulai tour', 'Start tour')}</button>
				<button class="later press" onclick={() => tour.decline()}>{tr('Langsung pakai', 'Jump right in')}</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.ob {
		--ogee: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpath d='M0 100V52C0 33 13 23 29 15C39 10 46 6 50 0C54 6 61 10 71 15C87 23 100 33 100 52V100Z'/%3E%3C/svg%3E");
		position: fixed;
		inset: 0;
		z-index: 60;
		display: flex;
		flex-direction: column;
		background: var(--paper);
		outline: none;
	}
	.col {
		flex: 1;
		min-height: 0;
		width: 100%;
		max-width: 430px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		padding: env(safe-area-inset-top, 0px) 22px calc(16px + var(--safe-b));
	}
	.bar {
		flex: none;
		height: 56px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.back {
		width: 38px;
		height: 38px;
		border-radius: 12px;
		display: grid;
		place-items: center;
		background: var(--sunk);
		color: var(--navy);
	}
	.skip {
		font-size: 13.5px;
		font-weight: 700;
		color: var(--ink2);
		padding: 8px 2px;
	}

	.door {
		flex: none;
		position: relative;
		align-self: center;
		height: clamp(130px, 28dvh, 290px);
		aspect-ratio: 148 / 188;
		background: var(--arch);
		-webkit-mask: var(--ogee) 0 0/100% 100% no-repeat;
		mask: var(--ogee) 0 0/100% 100% no-repeat;
		border-radius: 0 0 22px 22px;
		transition: height 0.45s var(--ease);
	}
	/* Langkah lokasi butuh ruang untuk formulir, jadi pintunya mengecil. */
	.door.small {
		height: clamp(84px, 15dvh, 130px);
	}
	.win {
		position: absolute;
		inset: 8% 9% 0;
		overflow: hidden;
		-webkit-mask: var(--ogee) 0 0/100% 100% no-repeat;
		mask: var(--ogee) 0 0/100% 100% no-repeat;
	}
	.sky {
		position: absolute;
		inset: 0;
		opacity: 0;
		transition: opacity 0.7s ease;
	}
	.sky.on {
		opacity: 1;
	}
	.sun {
		position: absolute;
		left: 50%;
		top: 56%;
		width: 30%;
		aspect-ratio: 1;
		border-radius: 50%;
		background: var(--peach-sun);
		box-shadow: 0 0 0 9px rgba(237, 160, 125, 0.22);
		transform: translate(-50%, -50%) translate(var(--sx), var(--sy));
		transition: transform 0.8s var(--ease);
	}
	.hill {
		position: absolute;
		left: -30%;
		right: -30%;
		bottom: -29%;
		height: 60%;
		border-radius: 50% 50% 0 0 / 100% 100% 0 0;
		background: var(--cream);
	}

	.body {
		flex: 1 1 auto;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: 20px 2px 12px;
	}
	.pane {
		animation: rise 0.35s var(--ease) both;
	}
	h1 {
		margin: 0;
		font-weight: 500;
		font-size: 30px;
		line-height: 1.15;
	}
	.lead {
		margin: 8px 0 0;
		font-size: 14.5px;
		line-height: 1.55;
		color: var(--ink2);
	}
	.langs {
		margin-top: 18px;
	}
	.feat {
		list-style: none;
		margin: 14px 0 0;
		padding: 0;
		display: grid;
		gap: 12px;
	}
	.feat li {
		display: flex;
		gap: 12px;
		align-items: center;
	}
	.fi {
		flex: none;
		width: 38px;
		height: 38px;
		border-radius: 13px;
		display: grid;
		place-items: center;
		background: var(--navy-soft);
		color: var(--navy);
	}
	.feat b {
		display: block;
		font-size: 14px;
	}
	.feat small {
		display: block;
		margin-top: 1px;
		font-size: 12.5px;
		line-height: 1.4;
		color: var(--ink2);
	}
	.note {
		margin: 14px 0 0;
		font-size: 12px;
		color: var(--ink3);
	}
	.next {
		display: block;
		margin-top: 14px;
		padding: 13px 14px;
	}
	.np {
		display: block;
		margin-top: 4px;
		font-size: 20px;
	}

	.foot {
		flex: none;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		padding-top: 8px;
	}
	.dots {
		flex: 1;
		display: flex;
		gap: 5px;
	}
	.dots span {
		width: 7px;
		height: 7px;
		border-radius: 99px;
		background: var(--line-strong);
		transition: width 0.3s var(--ease);
	}
	.dots span.on {
		width: 20px;
		background: var(--peach);
	}
	.go,
	.later {
		height: 50px;
		border-radius: 16px;
		font-size: 15px;
		font-weight: 700;
	}
	.go {
		padding: 0 34px;
		background: var(--navy);
		color: var(--on-navy);
	}
	.go.wide,
	.later {
		width: 100%;
	}
	.later {
		background: var(--sunk);
		color: var(--ink);
	}
</style>
