<script lang="ts" module>
	import type { SkyPhase } from '#lib/prayer.ts';

	// Langit tiap waktu. Gradien ini bukan hiasan: ia memberi tahu "sekarang waktu apa" tanpa membaca angka.
	export const SKY: Record<SkyPhase, { g: string; stars: number; ink: string }> = {
		subuh: { g: 'linear-gradient(180deg,#34426E 0%,#7F7BA6 52%,#F1B497 100%)', stars: 0.7, ink: '#fff' },
		dhuha: { g: 'linear-gradient(180deg,#A7CAEA 0%,#CFE2F3 55%,#F7E4D6 100%)', stars: 0, ink: '#33506F' },
		dzuhur: { g: 'linear-gradient(180deg,#93BFE8 0%,#C3DBF1 60%,#E2EEF8 100%)', stars: 0, ink: '#33506F' },
		ashar: { g: 'linear-gradient(180deg,#A9C7E3 0%,#E2CDB8 62%,#F3D2B4 100%)', stars: 0, ink: '#33506F' },
		maghrib: { g: 'linear-gradient(180deg,#4E5287 0%,#B87C93 52%,#F2A07C 100%)', stars: 0.35, ink: '#fff' },
		isya: { g: 'linear-gradient(180deg,#17253F 0%,#26395E 60%,#3B5582 100%)', stars: 1, ink: '#fff' }
	};

	// Bintang ditaruh deterministik supaya tidak "lompat" antara prerender dan browser.
	const STARS = Array.from({ length: 34 }, (_, i) => ({
		x: (i * 37) % 100,
		y: (i * 53) % 62,
		delay: (i % 7) * 0.4,
		o: 0.4 + (i % 5) / 8
	}));

	// Busur kuadratik di koordinat SVG 360x200 (direntang mengikuti lebar jendela).
	const ARC_TOP = 62;
	const [X0, X1, CX, CY, Y0] = [22, 338, 180, -30, 192];
	const PAD = 0.04; // ujung busur sedikit ke dalam supaya titik tidak terpotong bingkai
	function arcPoint(f: number): [number, number] {
		const t = PAD + (1 - 2 * PAD) * Math.min(1, Math.max(0, f));
		const u = 1 - t;
		return [u * u * X0 + 2 * u * t * CX + t * t * X1, u * u * Y0 + 2 * u * t * CY + t * t * Y0];
	}
</script>

<script lang="ts">
	import { countdown, formatTime, tzLabel } from '#lib/date.ts';
	import { heroArc, nextPrayer, skyPhase, type DayTimes } from '#lib/prayer.ts';
	import Icon from './Icon.svelte';
	import { settings } from '#lib/state/app.svelte.ts';

	let {
		now,
		yesterday,
		today,
		tomorrow
	}: { now: Date | null; yesterday: DayTimes | null; today: DayTimes | null; tomorrow: DayTimes | null } = $props();

	const ready = $derived(!!(now && yesterday && today && tomorrow));
	const arc = $derived(ready ? heroArc(now!, yesterday!, today!, tomorrow!, settings.value.imsak) : null);
	const frac = (d: Date) => (arc ? (+d - +arc.start) / (+arc.end - +arc.start) : 0.5);

	const points = $derived(arc ? arc.points.map((p) => ({ ...p, pt: arcPoint(frac(p.at)) })) : []);

	// Malam: ruas busur sepertiga malam terakhir disorot (disampling jadi garis halus).
	const highlight = $derived.by(() => {
		if (!arc?.lastThird) return '';
		const a = frac(arc.lastThird.from);
		const b = frac(arc.lastThird.to);
		return Array.from({ length: 25 }, (_, i) => arcPoint(a + ((b - a) * i) / 24).join(',')).join(' ');
	});

	const phase = $derived(now && today ? skyPhase(now, today) : 'dzuhur');
	const sky = $derived(SKY[phase]);
	const isNight = $derived(arc?.mode === 'night');
	const body = $derived(arcPoint(now && arc ? frac(now) : 0.5));

	const next = $derived(ready ? nextPrayer(now!, today!, tomorrow!) : null);
	const tz = $derived(now ? tzLabel(now) : '');
	const inLastThird = $derived(!!(now && arc?.lastThird && now >= arc.lastThird.from && now < arc.lastThird.to));
</script>

<section class="hero" aria-label="Waktu salat berikutnya">
	<div class="arch">
		<div class="win" style:--sky={sky.g} style:--stars={sky.stars} style:--sky-ink={sky.ink}>
			<div class="stars" aria-hidden="true">
				{#each STARS as s, i (i)}
					<i style:left="{s.x}%" style:top="{s.y}%" style:animation-delay="{s.delay}s" style:opacity={s.o}></i>
				{/each}
			</div>
			<svg class="path" viewBox="0 0 360 200" preserveAspectRatio="none" aria-hidden="true">
				<path d="M{X0} {Y0} Q{CX} {CY} {X1} {Y0}" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="1.2" stroke-dasharray="3 5" />
				{#if highlight}
					<polyline class="third" points={highlight} />
				{/if}
				{#each points as p (p.label)}
					{#if p.kind === 'prayer'}
						<circle cx={p.pt[0]} cy={p.pt[1]} r="3.2" fill="currentColor" fill-opacity=".9" />
					{:else}
						<circle cx={p.pt[0]} cy={p.pt[1]} r="3.4" fill="none" stroke="currentColor" stroke-opacity=".85" stroke-width="1.3" />
					{/if}
					<text
						x={p.place === 'right' ? p.pt[0] + 8 : p.pt[0]}
						y={p.place === 'below' ? p.pt[1] + 18 : p.place === 'right' ? p.pt[1] + 3.5 : p.pt[1] - 10}
						text-anchor={p.place === 'right' ? 'start' : 'middle'}
						class:mk={p.kind === 'marker'}
						class:hid={Math.abs(p.pt[0] - body[0]) < 30 && Math.abs(p.pt[1] - body[1]) < 40}>{p.label}</text
					>
				{/each}
			</svg>
			<div
				class="body"
				class:moon={isNight}
				style:left="{(body[0] / 360) * 100}%"
				style:top="{ARC_TOP + body[1]}px"
				aria-hidden="true"
			></div>
			<svg class="hill" viewBox="0 0 360 150" preserveAspectRatio="none" aria-hidden="true">
				<path d="M0 150V128C55 62 150 26 240 24C292 23 330 33 360 46V150Z" fill="var(--cream)" />
			</svg>
			<!-- Bukit naik ke kanan seperti ikon; teks rata kanan di bagian bukit yang tinggi. -->
			<div class="txt">
				<div class="now">{next ? `Menuju ${next.name}` : 'Memuat jadwal'}</div>
				<div class="cd num disp" aria-live="off">{next && now ? countdown(+next.at - +now) : '--:--:--'}</div>
				<div class="sub">{next ? `Pukul ${formatTime(next.at)} ${tz}` : ' '}</div>
			</div>
		</div>
	</div>

	{#if arc}
		<div class="info">
			{#if arc.mode === 'night'}
				<span class="chip" class:hot={inLastThird}>
					<Icon name="star" size={14} />
					{inLastThird ? 'Sekarang 1/3 malam terakhir' : `1/3 malam terakhir ${formatTime(arc.lastThird!.from)}`}
				</span>
				<span class="chip">Imsak {formatTime(arc.imsak!)}</span>
			{:else}
				<span class="chip">Terbit {formatTime(arc.terbit!)}</span>
				<span class="chip">Terbenam {formatTime(arc.maghrib!)}</span>
			{/if}
		</div>
	{/if}
</section>

<style>
	/* Hero mengambil bentuk ikon aplikasi: pintu lengkung bawang navy, matahari peach, bukit krem. */
	.arch {
		--ogee: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpath d='M0 100V52C0 33 13 23 29 15C39 10 46 6 50 0C54 6 61 10 71 15C87 23 100 33 100 52V100Z'/%3E%3C/svg%3E");
		position: relative;
		height: 400px;
		background: var(--navy);
		-webkit-mask: var(--ogee) 0 0/100% 100% no-repeat;
		mask: var(--ogee) 0 0/100% 100% no-repeat;
		border-radius: 0 0 26px 26px;
		view-transition-name: hero;
	}
	.win {
		position: absolute;
		inset: 34px 26px 0 26px;
		overflow: hidden;
		background: var(--sky);
		color: var(--sky-ink);
		transition: background 1.2s var(--ease);
		-webkit-mask: var(--ogee) 0 0/100% 100% no-repeat;
		mask: var(--ogee) 0 0/100% 100% no-repeat;
	}
	.stars {
		position: absolute;
		inset: 0;
		opacity: var(--stars);
		transition: opacity 1.2s;
	}
	.stars i {
		position: absolute;
		width: 2px;
		height: 2px;
		border-radius: 50%;
		background: #fff;
		animation: tw 3s ease-in-out infinite;
	}
	@keyframes tw {
		50% {
			opacity: 0.25;
		}
	}
	.path {
		position: absolute;
		left: 0;
		right: 0;
		top: 62px;
		width: 100%;
		height: 200px;
		overflow: visible;
	}
	.path text {
		font-size: 9.5px;
		font-weight: 700;
		fill: currentColor;
		fill-opacity: 0.8;
		font-family: var(--f-body);
	}
	.path text {
		transition: fill-opacity 0.4s;
	}
	.path text.mk {
		font-weight: 600;
		fill-opacity: 0.65;
	}
	.path text.hid {
		fill-opacity: 0;
	}
	.third {
		fill: none;
		stroke: #f2c6a8;
		stroke-width: 3;
		stroke-linecap: round;
		stroke-opacity: 0.9;
	}
	.body {
		position: absolute;
		width: 44px;
		height: 44px;
		margin: -22px 0 0 -22px;
		border-radius: 50%;
		background: var(--peach-sun);
		box-shadow: 0 0 0 12px rgba(237, 160, 125, 0.18);
		transition:
			left 1.2s var(--ease),
			top 1.2s var(--ease),
			background 1.2s;
	}
	.body.moon {
		width: 30px;
		height: 30px;
		margin: -15px 0 0 -15px;
		background: #f1eee6;
		box-shadow:
			0 0 0 10px rgba(241, 238, 230, 0.12),
			inset -7px -3px 0 #d9d4c6;
	}
	.hill {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 150px;
	}
	.txt {
		position: absolute;
		right: 20px;
		bottom: 18px;
		text-align: right;
		color: var(--ink);
	}
	.now {
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--peach-ink);
	}
	.cd {
		font-weight: 400;
		font-size: 46px;
		line-height: 1;
		margin: 4px 0 3px;
	}
	.sub {
		font-size: 12.5px;
		color: var(--ink2);
		font-weight: 600;
		min-height: 1.2em;
	}
	.info {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 12px;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		height: 30px;
		padding: 0 11px;
		white-space: nowrap;
		border-radius: 999px;
		background: var(--card);
		box-shadow: var(--shadow);
		font-size: 12px;
		font-weight: 700;
		color: var(--ink2);
	}
	.chip :global(svg) {
		color: var(--peach);
	}
	.chip.hot {
		background: var(--peach-soft);
		color: var(--peach-ink);
	}
</style>
