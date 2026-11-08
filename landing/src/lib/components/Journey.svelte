<script lang="ts">
	import { onMount } from 'svelte';
	import { APP_URL, REPO_URL } from '#lib/config.ts';
	import { clamp, lerp, motionOn, onFrame, range, smooth, styler } from '#lib/scroll.ts';
	import data from '#lib/screens.json';
	import { FIELD_STARS, PHASES, SKY, skyGradient, type Phase } from '#lib/sky.ts';
	import Door from './Door.svelte';
	import Icon from './Icon.svelte';
	import Phone, { type Shot } from './Phone.svelte';

	/*
		Satu adegan gulir panjang:
		1. Hero: pintu lengkung dengan langit sungguhan saat ini.
		2. Gulir: pintu membesar sampai kita "masuk", langit bergeser ke Subuh.
		3. Satu hari: langit berganti Subuh, Pagi, Dzuhur, Ashar, Maghrib, Malam; matahari berjalan
		   di busur, dan HP menampilkan fitur yang cocok dengan waktunya.
		Tanpa JavaScript atau dengan "kurangi gerakan", semuanya tampil sebagai daftar biasa.
	*/

	const shot = (id: string) => data.screens.find((s) => s.id === id) as Shot;

	const CHAPTERS: { shot: Shot; phase: Phase; name: string; dot: string; title: string; text: string }[] = [
		{
			shot: shot('beranda-subuh'),
			phase: 'subuh',
			name: 'Subuh',
			dot: 'Subuh',
			title: 'Jadwal salat',
			text: 'Hitung mundur ke salat berikutnya langsung di beranda. Warna langit dan posisi matahari ikut jam.'
		},
		{
			shot: shot('dzikir-pagi'),
			phase: 'dhuha',
			name: 'Pagi',
			dot: 'Pagi',
			title: 'Dzikir pagi & petang',
			text: 'Counter di tiap bacaan, hitungannya tersimpan. Ada dua versi bacaan, semuanya dengan sumber.'
		},
		{
			shot: shot('tracker'),
			phase: 'dzuhur',
			name: 'Dzuhur',
			dot: 'Dzuhur',
			title: 'Tracker salat',
			text: 'Centang dari beranda, streak dan riwayat 6 bulan langsung ter-update. Ada mode udzur untuk haid.'
		},
		{
			shot: shot('doa'),
			phase: 'ashar',
			name: 'Ashar',
			dot: 'Ashar',
			title: 'Kumpulan doa',
			text: 'Teks Arab, latin, dan terjemahan, lengkap dengan sumbernya. Search toleran ejaan: dhuha atau duha tetap ketemu.'
		},
		{
			shot: shot('quran'),
			phase: 'maghrib',
			name: 'Maghrib',
			dot: 'Maghrib',
			title: "Al-Qur'an",
			text: '114 surat dengan latin, terjemahan Kemenag, dan arti per kata. Lanjut dari ayat terakhir yang dibaca.'
		},
		{
			shot: shot('beranda-malam'),
			phase: 'isya',
			name: 'Malam',
			dot: 'Isya',
			title: 'Sepertiga malam terakhir',
			text: 'Lewat Isya, beranda menandai sepertiga malam terakhir dan jam imsak. Ada dark mode juga.'
		}
	];
	const N = CHAPTERS.length;
	const clockOf = (at: string) => at.slice(11, 16).replace(':', '.');

	// Panjang adegan dalam satuan layar (tinggi viewport).
	const ZOOM_A = 0.08; // pintu mulai membesar
	const ZOOM_B = 1.1; // jendela pintu sudah menutupi layar
	const START = 1.4; // bab pertama tampil penuh
	const CH = 0.95; // panjang tiap bab
	const LEN = START + (N - 1) * CH + 0.75;
	// Posisi matahari di busur untuk tiap bab (0 = ujung kiri, 1 = ujung kanan, >1 = tenggelam).
	const SUN_AT = [0.03, 0.25, 0.5, 0.72, 0.92, 1.14];
	const DOT_AT = [0.03, 0.25, 0.5, 0.72, 0.92, 0.985];

	let section = $state<HTMLElement>();
	let stage = $state<HTMLElement>();
	let heroCopy = $state<HTMLElement>();
	let cue = $state<HTMLElement>();
	let doorWrap = $state<HTMLElement>();
	let doorEl = $state<HTMLElement>();
	let skybox = $state<HTMLElement>();
	let starsEl = $state<HTMLElement>();
	let arcEl = $state<HTMLElement>();
	let sunEl = $state<HTMLElement>();
	let moonEl = $state<HTMLElement>();
	let hillEl = $state<HTMLElement>();
	let hillDusk = $state<SVGPathElement>();
	let hillNight = $state<SVGPathElement>();
	// Bukit naik ke kanan seperti ikon aplikasinya.
	const HILL = 'M0 240V200C230 96 610 36 990 32C1190 30 1340 56 1440 82V240Z';
	let phoneLayer = $state<HTMLElement>();
	let chaptersEl = $state<HTMLElement>();
	const layers: HTMLElement[] = [];

	let active = $state(0);
	let loadTo = $state(-1);
	let lightInk = $state(true);
	let W = $state(1280);
	let H = $state(800);
	const narrow = $derived(W < 900);

	// Busur besar di adegan, dalam piksel layar.
	const arc = $derived.by(() => {
		if (!narrow) return { x0: 0.04 * W, y0: 0.8 * H, cx: 0.5 * W, cy: -0.16 * H, x1: 0.96 * W, y1: 0.8 * H };
		// Di HP busurnya landai: puncaknya di celah antara kartu teks dan HP.
		const peak = Math.max(0.41 * H, 320) - 14;
		const y0 = peak + 0.09 * H;
		return { x0: 0.02 * W, y0, cx: 0.5 * W, cy: 2 * peak - y0, x1: 0.98 * W, y1: y0 };
	});
	function at(t: number): [number, number] {
		const u = 1 - t;
		const a = arc;
		return [u * u * a.x0 + 2 * u * t * a.cx + t * t * a.x1, u * u * a.y0 + 2 * u * t * a.cy + t * t * a.y1];
	}
	const dots = $derived(CHAPTERS.map((c, i) => ({ label: c.dot, pt: at(DOT_AT[i]) })));

	let geo: { S: number; tx: number; ty: number } | null = null;

	function measure() {
		if (!stage || !doorWrap || !doorEl) return;
		W = stage.clientWidth;
		H = stage.clientHeight;
		const prev = doorWrap.style.transform;
		doorWrap.style.transform = 'none';
		const sr = stage.getBoundingClientRect();
		const wr = doorWrap.getBoundingClientRect();
		const dr = doorEl.getBoundingClientRect();
		doorWrap.style.transform = prev;
		// Jendela pintu: inset 8.5% atas, 7% kiri-kanan (lihat Door.svelte).
		const wl = dr.left - sr.left + dr.width * 0.07;
		const ww = dr.width * 0.86;
		const wt = dr.top - sr.top + dr.height * 0.085;
		const wh = dr.height * 0.915;
		// Titik pusat bagian persegi jendela (di bawah lengkungan): ke sinilah kita "masuk".
		const ox = wl + ww / 2;
		const oy = wt + wh * 0.76;
		doorWrap.style.transformOrigin = `${ox - (wr.left - sr.left)}px ${oy - (wr.top - sr.top)}px`;
		geo = { S: Math.max(W / ww, H / (wh * 0.48)) * 1.12, tx: W / 2 - ox, ty: H / 2 - oy };
	}

	const set = styler();

	function frame() {
		if (!section || !stage) return;
		const r = section.getBoundingClientRect();
		const h = stage.clientHeight;
		// Adegan sudah lewat: hentikan animasi bintang, sisanya tidak perlu ditulis ulang.
		if (r.bottom < 0) {
			starsEl!.classList.remove('run');
			return;
		}
		const s = clamp(-r.top / h, 0, LEN);
		const past = s > ZOOM_B + 0.1;

		// 1. Hero: teks naik dan memudar, pintu membesar.
		const out = range(s, 0.03, 0.3);
		set(heroCopy!, 'opacity', (1 - out).toFixed(3));
		set(heroCopy!, 'transform', `translate3d(0, ${(-out * 0.08 * h).toFixed(1)}px, 0)`);
		// Tombol hero yang sudah hilang jangan sampai masih bisa diklik atau kena Tab.
		set(heroCopy!, 'visibility', out >= 1 ? 'hidden' : 'visible');
		set(cue!, 'opacity', (1 - range(s, 0, 0.08)).toFixed(3));
		const z = smooth(range(s, ZOOM_A, ZOOM_B));
		if (geo) {
			// Skala eksponensial terasa seperti maju dengan kecepatan tetap. Geseran ke tengah sengaja
			// tertinggal (z kuadrat) supaya tepi bawah jendela tidak sempat naik dan memperlihatkan latar.
			const k = Math.exp(Math.log(geo.S) * z);
			const m = z * z;
			set(doorWrap!, 'transform', `translate3d(${(geo.tx * m).toFixed(1)}px, ${(geo.ty * m).toFixed(1)}px, 0) scale(${k.toFixed(4)})`);
		}
		set(doorEl!, '--inner', (1 - range(s, 0.1, 0.48)).toFixed(3));
		set(doorEl!, '--dawn', smooth(range(s, 0.28, 0.85)).toFixed(3));
		set(doorWrap!, 'visibility', past ? 'hidden' : 'visible');
		set(doorWrap!, 'will-change', past ? 'auto' : 'transform');
		doorEl!.classList.toggle('idle', past);

		// 2. Langit adegan menggantikan jendela pintu.
		set(skybox!, 'opacity', range(s, 0.86, 1.08).toFixed(3));

		// 3. Satu hari. phi = posisi bab (pecahan); langit bertahan di tengah bab dan berganti di perbatasan.
		const phi = (s - START) / CH;
		const base = clamp(Math.floor(phi), 0, N - 1);
		const sigma = phi <= 0 ? 0 : Math.min(N - 1, base + smooth(range(phi - base, 0.3, 0.7)));
		const lo = Math.floor(sigma);
		const f = sigma - lo;
		layers.forEach((el, k) => {
			const top = k === lo + 1 && f > 0;
			set(el, 'opacity', k === lo ? '1' : top ? f.toFixed(3) : '0');
			set(el, 'visibility', k === lo || top ? 'visible' : 'hidden');
			// Hanya lapisan yang sedang berganti yang perlu layer GPU sendiri.
			set(el, 'will-change', top ? 'opacity' : 'auto');
		});
		const hi = Math.min(lo + 1, N - 1);
		const stars = lerp(SKY[PHASES[lo]].stars, SKY[PHASES[hi]].stars, f);
		set(starsEl!, 'opacity', stars.toFixed(3));
		starsEl!.classList.toggle('run', stars > 0.01 && s > 0.8);
		const ink = SKY[PHASES[Math.round(sigma)]].light;
		if (ink !== lightInk) lightInk = ink;
		const idx = clamp(Math.round(phi), 0, N - 1);
		if (idx !== active) active = idx;
		// Screenshot baru diunduh begitu mulai scroll, dan hanya sampai dua bab ke depan.
		if (s > 0.02 && idx + 2 > loadTo) loadTo = idx + 2;

		// 4. Masuknya busur, bukit, HP, dan teks bab.
		const ent = smooth(range(s, 0.95, START));
		set(arcEl!, 'clip-path', `inset(-20% ${((1 - ent) * 100).toFixed(2)}% -20% 0)`);
		set(hillEl!, 'transform', `translate3d(0, ${((1 - ent) * 100).toFixed(2)}%, 0)`);
		set(phoneLayer!, 'transform', `translate3d(0, ${((1 - ent) * 0.5 * h).toFixed(1)}px, 0)`);
		set(phoneLayer!, 'opacity', range(s, 0.95, 1.2).toFixed(3));
		set(chaptersEl!, 'opacity', range(s, 1.08, START).toFixed(3));
		// Bukit: krem di siang hari, siluet ungu tua saat Maghrib, navy saat malam.
		set(hillDusk!, 'opacity', range(sigma, 3.45, 3.95).toFixed(3));
		set(hillNight!, 'opacity', range(sigma, 4.3, 4.9).toFixed(3));

		// 5. Matahari berjalan terus mengikuti gulir; bulan terbit setelah Maghrib.
		const sp = clamp(phi, 0, N - 1);
		const a = Math.floor(sp);
		const b = Math.min(a + 1, N - 1);
		const [sx, sy] = at(lerp(SUN_AT[a], SUN_AT[b], sp - a));
		set(sunEl!, 'transform', `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`);
		set(sunEl!, 'opacity', (ent * (1 - range(sp, 4.3, 4.75))).toFixed(3));
		const [mx, my] = at(lerp(0.3, 0.6, range(sp, 4.35, 5)));
		set(moonEl!, 'transform', `translate3d(${mx.toFixed(1)}px, ${my.toFixed(1)}px, 0)`);
		set(moonEl!, 'opacity', range(sp, 4.4, 4.85).toFixed(3));
	}

	let motion = $state(false);
	onMount(() => {
		motion = motionOn();
		if (!motion) return;
		measure();
		const ro = new ResizeObserver(() => {
			measure();
			frame();
		});
		ro.observe(stage!);
		// Ukuran pintu di HP ikut tinggi teks hero, yang berubah saat font selesai dimuat.
		ro.observe(doorEl!);
		const stop = onFrame(frame);
		return () => {
			ro.disconnect();
			stop();
		};
	});
</script>

<section class="journey" bind:this={section} style:--len={LEN + 1} style:--start={START} aria-label="Muslims Daily">
	<span id="fitur" class="anchor" aria-hidden="true"></span>
	<div class="stage pattern on-sky" bind:this={stage} class:ink-light={lightInk}>
		<header class="hero">
			<div class="copy" bind:this={heroCopy}>
				<p class="eyebrow"><span class="sun-dot"></span>Pendamping ibadah harian</p>
				<h1 class="disp">Teman ibadah dari Subuh sampai Isya</h1>
				<p class="lead">
					Jadwal salat, catatan salat, doa, dzikir, <span class="nw">Al-Qur'an,</span> dan kiblat dalam satu aplikasi. Ringan, tanpa akun, dan tetap
					jalan tanpa internet.
				</p>
				<div class="cta">
					<a class="btn primary" href={APP_URL}>Buka aplikasi <Icon name="arrow" size={18} /></a>
					<a class="btn ghost" href={REPO_URL}><Icon name="github" size={18} /> Lihat kodenya</a>
				</div>
				<p class="note">Gratis dan open source. Bisa <span class="nw">di-install</span> ke home screen HP.</p>
			</div>
			<div class="door-slot">
				<div class="door-wrap" bind:this={doorWrap}>
					<Door bind:el={doorEl} />
				</div>
			</div>
			<div class="cue" bind:this={cue} aria-hidden="true"><span></span>Gulir untuk masuk</div>
		</header>

		<!-- Lapisan adegan (hanya mode animasi) -->
		<div class="fx skybox" bind:this={skybox} aria-hidden="true">
			{#each PHASES as p, i (p)}
				<div class="layer" bind:this={layers[i]} style:background={skyGradient(p)}></div>
			{/each}
			<div class="field" bind:this={starsEl}>
				{#each FIELD_STARS as bg, i (i)}
					<i style:background-image={bg} style:animation-delay="{i * 1.1}s"></i>
				{/each}
			</div>
		</div>
		<div class="fx arc" bind:this={arcEl} aria-hidden="true">
			<svg viewBox="0 0 {W} {H}" preserveAspectRatio="none">
				<path d="M{arc.x0} {arc.y0} Q{arc.cx} {arc.cy} {arc.x1} {arc.y1}" />
			</svg>
			{#each dots as d, i (d.label)}
				<span class="dot" class:on={i === active} style:transform="translate3d({d.pt[0]}px, {d.pt[1]}px, 0)">
					<i></i><b>{d.label}</b>
				</span>
			{/each}
		</div>
		<div class="fx sun" bind:this={sunEl} aria-hidden="true"></div>
		<div class="fx moon" bind:this={moonEl} aria-hidden="true"></div>
		<div class="fx hill" bind:this={hillEl} aria-hidden="true">
			<svg viewBox="0 0 1440 240" preserveAspectRatio="none">
				<path class="day" d={HILL} />
				<path class="dusk" bind:this={hillDusk} d={HILL} />
				<path class="night" bind:this={hillNight} d={HILL} />
			</svg>
		</div>
		<div class="fx phone-layer" bind:this={phoneLayer}>
			<div class="phone-pos">
				<Phone shots={CHAPTERS.map((c) => c.shot)} {active} load={loadTo} />
			</div>
		</div>

		<div class="chapters-wrap" bind:this={chaptersEl}>
			<h2 class="story-h sr-only">Sehari pakai Muslims Daily</h2>
			<ol class="chapters">
				{#each CHAPTERS as c, i (c.name)}
					<li class="chapter" class:on={i === active} class:light={SKY[c.phase].light} style:--bg={skyGradient(c.phase)}>
						<div class="ch-copy">
							<p class="when"><span>{c.name}</span><span class="num">{clockOf(c.shot.at)}</span></p>
							<h3 class="disp">{c.title}</h3>
							<p class="txt">{c.text}</p>
							<ol class="steps" aria-label="{i + 1} dari {N}">
								{#each CHAPTERS as _, k (k)}
									<li class:done={k < i} class:now={k === i}></li>
								{/each}
							</ol>
						</div>
						{#if !motion}
							<div class="own-phone">
								<Phone shots={[c.shot]} />
							</div>
						{/if}
					</li>
				{/each}
			</ol>
		</div>
	</div>
</section>

<style>
	.journey {
		position: relative;
	}
	.anchor {
		position: absolute;
		top: 100svh;
		left: 0;
	}
	:global(.motion) .journey {
		height: calc(var(--len) * 100vh);
	}
	/* scroll-margin negatif membatalkan scroll-padding nav, supaya berhenti tepat di bab pertama. */
	:global(.motion) .anchor {
		top: calc(var(--start) * 100vh);
		scroll-margin-top: calc(-1 * var(--nav-h));
	}
	.stage {
		position: relative;
	}
	:global(.motion) .stage {
		position: sticky;
		top: 0;
		height: 100vh;
		overflow: hidden;
	}

	/* ---------- hero ---------- */
	.hero {
		position: relative;
		z-index: 1;
		min-height: 100svh;
		display: grid;
		grid-template-rows: auto 1fr;
		padding: calc(var(--nav-h) + 18px) var(--gutter) 0;
	}
	:global(.motion) .hero {
		position: absolute;
		inset: 0;
		min-height: 0;
	}
	.copy {
		max-width: 560px;
		will-change: transform, opacity;
	}
	.eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 9px;
		margin: 0 0 16px;
		padding: 7px 14px 7px 9px;
		border-radius: 999px;
		background: var(--card);
		box-shadow: var(--shadow);
		font-size: 12.5px;
		font-weight: 700;
		color: var(--ink2);
	}
	.sun-dot {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--peach-sun);
		box-shadow: 0 0 0 4px rgba(237, 160, 125, 0.22);
	}
	h1 {
		margin: 0;
		font-size: clamp(38px, 6.4vw, 84px);
		line-height: 1;
		letter-spacing: -0.035em;
		text-wrap: balance;
	}
	.copy .lead {
		margin-top: 18px;
		max-width: 500px;
	}
	.cta {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 26px;
	}
	.note {
		margin: 16px 0 0;
		font-size: 13px;
		font-weight: 600;
		color: var(--ink2);
	}
	.door-slot {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: flex-end;
		min-height: 230px;
		margin-top: 22px;
	}
	.door-wrap {
		height: min(100%, 440px, calc((100vw - 2 * var(--gutter)) / 0.88));
		will-change: transform;
	}
	:global(.motion) .door-slot {
		min-height: 0;
	}
	.cue {
		display: none;
	}
	:global(html:not(.motion)) .cue {
		display: none !important;
	}

	/* HP: semuanya di tengah, dan tinggi hero mengikuti layar saat bilah alamat masih tampil. */
	@media (max-width: 899px) {
		:global(.motion) .hero {
			bottom: auto;
			height: 100svh;
		}
		.hero {
			padding-top: calc(var(--nav-h) + 10px);
		}
		.copy {
			margin-inline: auto;
			max-width: 460px;
			text-align: center;
		}
		.copy .lead {
			margin-inline: auto;
			max-width: 36ch;
			text-wrap: balance;
		}
		.cta {
			justify-content: center;
		}
		.cta .btn {
			height: 48px;
			padding: 0 18px;
			font-size: 14.5px;
		}
		.note {
			text-wrap: balance;
		}
		.door-slot {
			margin-top: 16px;
		}
	}
	@media (max-width: 899px) and (max-height: 680px) {
		.eyebrow {
			display: none;
		}
	}
	@media (max-width: 899px) and (max-height: 780px) {
		.note {
			display: none;
		}
		.copy .lead {
			font-size: 15px;
			margin-top: 12px;
		}
		.cta {
			margin-top: 18px;
		}
	}
	@media (min-width: 900px) {
		.hero {
			grid-template-rows: none;
			grid-template-columns: minmax(0, 1fr) auto;
			column-gap: 4vw;
			padding: 0 max(var(--gutter), calc(50vw - 600px));
		}
		.copy {
			align-self: center;
			padding-top: var(--nav-h);
		}
		.door-slot {
			margin: 0;
			height: 100svh;
		}
		:global(.motion) .door-slot {
			height: 100%;
		}
		.door-wrap {
			height: min(84%, 800px, calc(46vw / 0.88));
		}
		.cue {
			position: absolute;
			left: max(var(--gutter), calc(50vw - 600px));
			bottom: 30px;
			display: flex;
			align-items: center;
			gap: 12px;
			font-size: 12px;
			font-weight: 800;
			letter-spacing: 0.12em;
			text-transform: uppercase;
			color: var(--ink2);
		}
		.cue span {
			position: relative;
			width: 2px;
			height: 34px;
			border-radius: 2px;
			background: var(--line-strong);
			overflow: hidden;
		}
		.cue span::after {
			content: '';
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			height: 40%;
			background: var(--navy);
			transform: translateY(-100%);
			animation: drip 1.8s var(--ease) infinite;
		}
	}
	@keyframes drip {
		to {
			transform: translateY(260%);
		}
	}

	/* ---------- lapisan adegan ---------- */
	.fx {
		display: none;
	}
	:global(.motion) .fx {
		display: block;
		position: absolute;
		pointer-events: none;
	}
	.skybox {
		inset: 0;
		z-index: 2;
		opacity: 0;
	}
	.layer {
		position: absolute;
		inset: 0;
		opacity: 0;
	}
	.field {
		position: absolute;
		inset: 0;
		opacity: 0;
	}
	.field i {
		position: absolute;
		inset: 0;
		background-size: 100% 100%;
	}
	.field:global(.run) i {
		will-change: opacity;
		animation: tw 3.2s ease-in-out infinite;
	}
	@keyframes tw {
		50% {
			opacity: 0.25;
		}
	}
	/* State awal sama dengan posisi paling atas, supaya tidak muncul sebelum JavaScript jalan. */
	.arc {
		clip-path: inset(-20% 100% -20% 0);
		inset: 0;
		z-index: 3;
		color: #33506f;
		transition: color 0.6s;
	}
	.stage.ink-light .arc {
		color: #fff;
	}
	.arc svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
	}
	.arc path {
		fill: none;
		stroke: currentColor;
		stroke-opacity: 0.42;
		stroke-width: 1.4;
		stroke-dasharray: 3 7;
		vector-effect: non-scaling-stroke;
	}
	.dot {
		position: absolute;
		left: 0;
		top: 0;
	}
	.dot i {
		position: absolute;
		width: 8px;
		height: 8px;
		margin: -4px 0 0 -4px;
		border-radius: 50%;
		background: currentColor;
		opacity: 0.85;
		transition: transform 0.4s var(--ease);
	}
	.dot b {
		position: absolute;
		left: 0;
		bottom: 12px;
		transform: translateX(-50%);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.02em;
		white-space: nowrap;
		opacity: 0.75;
		transition: opacity 0.4s;
	}
	.dot.on i {
		transform: scale(1.6);
		opacity: 1;
	}
	.dot.on b {
		opacity: 1;
	}
	.sun,
	.moon {
		left: 0;
		top: 0;
		z-index: 3;
		width: 0;
		height: 0;
		opacity: 0;
		will-change: transform;
	}
	.sun::before,
	.moon::before {
		content: '';
		position: absolute;
		border-radius: 50%;
	}
	.sun::before {
		width: 80px;
		height: 80px;
		margin: -40px 0 0 -40px;
		background: #eda07d;
		box-shadow:
			0 0 0 22px rgba(237, 160, 125, 0.18),
			0 0 120px 40px rgba(237, 160, 125, 0.28);
	}
	.moon::before {
		width: 54px;
		height: 54px;
		margin: -27px 0 0 -27px;
		background: #f1eee6;
		box-shadow:
			0 0 0 16px rgba(241, 238, 230, 0.1),
			0 0 90px 20px rgba(241, 238, 230, 0.12),
			inset -12px -6px 0 #d9d4c6;
	}
	.hill {
		transform: translate3d(0, 100%, 0);
		left: 0;
		right: 0;
		bottom: -1px;
		height: 24vh;
		z-index: 4;
		will-change: transform;
	}
	.hill svg {
		width: 100%;
		height: 100%;
		display: block;
	}
	.hill .day {
		fill: #fdf3ea;
	}
	.hill .dusk {
		fill: #3d3150;
		opacity: 0;
	}
	.hill .night {
		fill: #0f1a26;
		opacity: 0;
	}
	.phone-layer {
		inset: 0;
		z-index: 5;
		opacity: 0;
		will-change: transform, opacity;
	}
	.phone-pos {
		position: absolute;
		left: 62%;
		top: 50%;
		width: min(37vh, 360px);
		transform: translateY(-48%);
	}

	/* ---------- bab ---------- */
	.chapters {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.chapter {
		position: relative;
		display: grid;
		gap: 36px;
		align-items: center;
		padding: 88px var(--gutter);
		background: var(--bg);
		color: #22384f;
	}
	.chapter.light {
		color: #fff;
	}
	.when {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 0 0 12px;
		font-size: 12px;
		font-weight: 800;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}
	.when .num {
		font-weight: 700;
		letter-spacing: 0.04em;
		opacity: 0.7;
	}
	.when span:first-child {
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}
	.when span:first-child::before {
		content: '';
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: #eda07d;
	}
	h3 {
		margin: 0;
		font-size: clamp(28px, 3.1vw, 42px);
		line-height: 1.06;
		letter-spacing: -0.03em;
		text-wrap: balance;
	}
	.txt {
		margin: 14px 0 0;
		font-size: clamp(15.5px, 1.25vw, 17.5px);
		line-height: 1.62;
		opacity: 0.86;
		text-wrap: pretty;
	}
	.steps {
		list-style: none;
		display: flex;
		gap: 5px;
		margin: 22px 0 0;
		padding: 0;
	}
	.steps li {
		width: 8px;
		height: 5px;
		border-radius: 3px;
		background: currentColor;
		opacity: 0.2;
	}
	.steps li.done {
		opacity: 0.5;
	}
	.steps li.now {
		width: 26px;
		opacity: 1;
		background: #eda07d;
	}
	.own-phone {
		width: min(300px, 72vw);
		margin: 0 auto;
	}
	/* Sebelum hidrasi di mode animasi: jangan sampai screenshot per bab ikut diunduh. */
	:global(.motion) .own-phone {
		display: none;
	}
	@media (min-width: 900px) {
		.chapter {
			grid-template-columns: minmax(0, 480px) 320px;
			justify-content: center;
			column-gap: 8vw;
			padding: 110px var(--gutter);
		}
	}

	/* Mode animasi: bab ditumpuk di atas adegan, berganti mengikuti gulir. */
	:global(.motion) .chapters-wrap {
		position: absolute;
		inset: 0;
		z-index: 6;
		opacity: 0;
		pointer-events: none;
	}
	:global(.motion) .chapters,
	:global(.motion) .chapter {
		position: absolute;
		inset: 0;
		padding: 0;
		background: none;
	}
	:global(.motion) .ch-copy {
		position: absolute;
		left: max(var(--gutter), calc(50vw - 600px));
		top: 50%;
		width: min(460px, 38vw);
		padding: 30px 32px 32px;
		border-radius: var(--r-lg);
		background: rgba(250, 246, 241, 0.58);
		border: 1px solid rgba(255, 255, 255, 0.55);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.6),
			0 30px 60px -36px rgba(15, 26, 38, 0.45);
		opacity: 0;
		visibility: hidden;
		transform: translate3d(0, calc(-50% + 30px), 0);
		transition:
			opacity 0.25s var(--ease),
			transform 0s linear 0.25s,
			visibility 0s linear 0.25s;
	}
	:global(.motion) .chapter.light .ch-copy {
		background: rgba(15, 26, 38, 0.34);
		border-color: rgba(255, 255, 255, 0.14);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 30px 60px -36px rgba(0, 0, 0, 0.6);
	}
	/* Blur latar mahal: hanya kartu yang sedang tampil yang memakainya. */
	:global(.motion) .chapter.on .ch-copy {
		-webkit-backdrop-filter: blur(var(--glass, 18px)) saturate(160%);
		backdrop-filter: blur(var(--glass, 18px)) saturate(160%);
		opacity: 1;
		visibility: visible;
		transform: translate3d(0, -50%, 0);
		transition:
			opacity 0.5s var(--ease) 0.12s,
			transform 0.75s var(--ease) 0.12s,
			visibility 0s;
	}

	@media (max-width: 899px) {
		/* Di HP label busur tertutup kartu dan HP; cukup titiknya. */
		.arc .dot b {
			display: none;
		}
		.sun::before {
			width: 58px;
			height: 58px;
			margin: -29px 0 0 -29px;
		}
		.moon::before {
			width: 40px;
			height: 40px;
			margin: -20px 0 0 -20px;
		}
		.hill {
			height: 17vh;
		}
		.phone-pos {
			left: 50%;
			top: max(41vh, 320px);
			width: min(33vh, 74vw, 300px);
			transform: translateX(-50%);
		}
		:global(.motion) .ch-copy {
			left: var(--gutter);
			right: var(--gutter);
			--glass: 10px;
			top: calc(var(--nav-h) + 10px);
			width: auto;
			padding: 20px 20px 22px;
			transform: translate3d(0, 24px, 0);
		}
		:global(.motion) .chapter.on .ch-copy {
			transform: none;
		}
		:global(.motion) .ch-copy h3 {
			font-size: clamp(24px, 6.6vw, 30px);
		}
		:global(.motion) .ch-copy .txt {
			font-size: 14.5px;
			line-height: 1.55;
			margin-top: 8px;
		}
		:global(.motion) .ch-copy .when {
			margin-bottom: 8px;
		}
	}
</style>
