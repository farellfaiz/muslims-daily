<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import Icon from '#lib/components/Icon.svelte';
	import { ALIGN_DEG, angleDiff, distanceKm, headingFrom, qiblaBearing, smoothAngle, windName } from '#lib/qibla.ts';
	import { settings } from '#lib/state/app.svelte.ts';

	let cameFromApp = $state(false);
	afterNavigate(({ from }) => (cameFromApp = !!from));
	const back = () => (cameFromApp ? history.back() : goto('/'));

	const s = $derived(settings.value);
	const bearing = $derived(qiblaBearing(s.lat, s.lng));
	const km = $derived(Math.round(distanceKm(s.lat, s.lng)));
	const fmtKm = new Intl.NumberFormat('id-ID');

	/**
	 * idle = menunggu ketukan (iOS wajib minta izin lewat ketukan),
	 * live = kompas jalan, none = perangkat tanpa kompas (laptop) atau izin ditolak.
	 */
	let mode = $state<'idle' | 'live' | 'none'>('idle');
	let denied = $state(false);
	let heading = $state<number | null>(null);
	/** rotasi piringan tanpa batas 0-360 supaya animasi tidak berputar balik satu lingkaran */
	let rot = $state(0);
	let needCalib = $state(false);

	const diff = $derived(heading === null ? null : angleDiff(heading, bearing));
	const aligned = $derived(diff !== null && Math.abs(diff) <= ALIGN_DEG);
	const hint = $derived.by(() => {
		if (diff === null) return '';
		if (aligned) return 'Sudah menghadap kiblat';
		const d = Math.round(Math.abs(diff));
		return diff > 0 ? `Putar ke kanan ${d}°` : `Putar ke kiri ${d}°`;
	});

	$effect(() => {
		if (aligned) navigator.vibrate?.(25);
	});

	let stop: (() => void) | null = null;

	function listen() {
		const absolute = 'ondeviceorientationabsolute' in window;
		const type = (absolute ? 'deviceorientationabsolute' : 'deviceorientation') as 'deviceorientation';
		let got = false;
		const onEvent = (e: DeviceOrientationEvent) => {
			const ev = e as DeviceOrientationEvent & { webkitCompassHeading?: number; webkitCompassAccuracy?: number };
			const h = headingFrom(
				{
					alpha: ev.alpha,
					absolute: absolute ? true : ev.absolute,
					webkitCompassHeading: ev.webkitCompassHeading,
					webkitCompassAccuracy: ev.webkitCompassAccuracy
				},
				screen.orientation?.angle ?? 0
			);
			if (h === null) return;
			got = true;
			mode = 'live';
			const prev = heading;
			heading = smoothAngle(prev, h);
			rot -= prev === null ? heading : angleDiff(prev, heading);
			const acc = ev.webkitCompassAccuracy;
			needCalib = typeof acc === 'number' && (acc < 0 || acc > 25);
		};
		const onCalib = () => (needCalib = true);
		window.addEventListener(type, onEvent);
		window.addEventListener('compassneedscalibration', onCalib);
		// Laptop sering mengirim event kosong atau tidak sama sekali: anggap tidak ada kompas.
		const t = setTimeout(() => {
			if (!got) mode = 'none';
		}, 2500);
		stop = () => {
			clearTimeout(t);
			window.removeEventListener(type, onEvent);
			window.removeEventListener('compassneedscalibration', onCalib);
		};
	}

	type IOSOrientation = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> };

	async function enable() {
		const DOE = DeviceOrientationEvent as IOSOrientation;
		if (typeof DOE.requestPermission === 'function') {
			try {
				if ((await DOE.requestPermission()) !== 'granted') {
					denied = true;
					mode = 'none';
					return;
				}
			} catch {
				denied = true;
				mode = 'none';
				return;
			}
		}
		listen();
	}

	onMount(() => {
		if (typeof DeviceOrientationEvent === 'undefined') mode = 'none';
		else if (typeof (DeviceOrientationEvent as IOSOrientation).requestPermission !== 'function') listen();
		return () => stop?.();
	});

	const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);
	const CARD = [
		['U', 0],
		['T', 90],
		['S', 180],
		['B', 270]
	] as const;
</script>

<svelte:head>
	<title>Kiblat · Muslims Daily</title>
	<meta name="description" content="Arah kiblat dari lokasimu, dengan kompas di HP." />
</svelte:head>

<div class="bar">
	<button class="back press" aria-label="Kembali" onclick={back}><Icon name="back" /></button>
	<a class="loc press" href="/lainnya#lokasi"><Icon name="pin" size={15} />{s.label}</a>
</div>

<header class="page-head">
	<div class="label">Arah salat</div>
	<h1>Kiblat</h1>
</header>

<section class="card dialcard" class:aligned>
	<div class="dialwrap">
		<!-- Penunjuk arah hadap HP: tetap di atas, piringan yang berputar. -->
		<svg class="pointer" viewBox="0 0 24 16" aria-hidden="true"><path d="M12 0L22 16H2z" /></svg>
		<svg
			class="dial"
			viewBox="0 0 280 280"
			style:transform="rotate({mode === 'live' ? rot : 0}deg)"
			role="img"
			aria-label="Kompas. Kiblat {Math.round(bearing)} derajat dari utara."
		>
			<circle class="ring" cx="140" cy="140" r="132" />
			{#each TICKS as t (t)}
				<line
					class="tick"
					class:major={t % 90 === 0}
					class:mid={t % 30 === 0 && t % 90 !== 0}
					x1="140"
					y1="14"
					x2="140"
					y2={t % 30 === 0 ? 26 : 20}
					transform="rotate({t} 140 140)"
				/>
			{/each}
			{#each CARD as [l, d] (l)}
				<text class="card-l" class:n={l === 'U'} x="140" y="46" transform="rotate({d} 140 140)">{l}</text>
			{/each}
			<!-- garis dan ikon Ka'bah pada arah kiblat -->
			<g transform="rotate({bearing} 140 140)">
				<line class="qline" x1="140" y1="140" x2="140" y2="62" />
				<g transform="translate(140 46) rotate({-bearing - (mode === 'live' ? rot : 0)})">
					<rect class="kaaba" x="-11" y="-11" width="22" height="22" rx="3" />
					<rect class="kband" x="-11" y="-5" width="22" height="3.5" />
				</g>
			</g>
			<circle class="hub" cx="140" cy="140" r="7" />
		</svg>
	</div>

	<div class="read">
		<div class="deg disp num">{Math.round(bearing)}°</div>
		<div class="sub">dari utara, arah {windName(bearing)}</div>
	</div>

	{#if mode === 'live'}
		<div class="status" class:ok={aligned}>
			{#if aligned}<Icon name="check" size={16} stroke={2.4} />{/if}{hint}
		</div>
	{:else if mode === 'idle'}
		<button class="btn press" onclick={enable}><Icon name="compass" size={18} />Aktifkan kompas</button>
	{:else}
		<p class="status none">
			{denied ? 'Izin kompas ditolak.' : 'Kompas tidak tersedia di perangkat ini.'}
			Utara ada di atas: hadapkan badan ke {Math.round(bearing)}° searah jarum jam.
		</p>
	{/if}
</section>

<section class="card facts">
	<div class="fact">
		<span class="label">Jarak ke Ka'bah</span>
		<span class="v num">{fmtKm.format(km)} km</span>
	</div>
	<div class="fact">
		<span class="label">Dihitung dari</span>
		<span class="v">{s.label}</span>
	</div>
</section>

<section class="card tips" class:warn={needCalib}>
	<svg class="eight" viewBox="0 0 48 28" aria-hidden="true">
		<path d="M24 14C18 4 6 4 6 14s12 10 18 0 18-10 18 0-12 10-18 0z" />
	</svg>
	<div>
		<div class="v">{needCalib ? 'Kompas perlu dikalibrasi' : 'Agar arah akurat'}</div>
		<p>
			Gerakkan HP membentuk angka 8 beberapa kali. Letakkan mendatar dan jauhkan dari magnet, logam, atau casing
			bermagnet.
		</p>
	</div>
</section>

<style>
	.bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 18px;
	}
	.back {
		width: 40px;
		height: 40px;
		border-radius: 14px;
		display: grid;
		place-items: center;
		background: var(--card);
		box-shadow: var(--shadow);
		border: 1px solid var(--line);
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
		max-width: 60%;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.page-head {
		padding-top: 14px;
	}
	.dialcard {
		padding: 26px 18px 20px;
		text-align: center;
		transition: box-shadow 0.4s var(--ease);
	}
	.dialcard.aligned {
		box-shadow:
			0 0 0 2px var(--peach),
			0 18px 40px -20px var(--peach);
	}
	.dialwrap {
		position: relative;
		width: min(280px, 100%);
		margin: 0 auto;
		aspect-ratio: 1;
	}
	.pointer {
		position: absolute;
		top: -12px;
		left: 50%;
		width: 20px;
		height: 13px;
		margin-left: -10px;
		fill: var(--navy);
		z-index: 1;
		transition: fill 0.3s;
	}
	.aligned .pointer {
		fill: var(--peach);
	}
	.dial {
		width: 100%;
		height: 100%;
		display: block;
		transition: transform 0.12s linear;
	}
	.ring {
		fill: var(--sunk);
		stroke: var(--line-strong);
	}
	.tick {
		stroke: var(--ink3);
		stroke-width: 1;
		stroke-linecap: round;
	}
	.tick.mid {
		stroke-width: 1.6;
	}
	.tick.major {
		stroke: var(--ink);
		stroke-width: 2.2;
	}
	.card-l {
		font-family: var(--f-body);
		font-size: 15px;
		font-weight: 800;
		fill: var(--ink2);
		text-anchor: middle;
	}
	.card-l.n {
		fill: var(--rose);
	}
	.qline {
		stroke: var(--peach);
		stroke-width: 3;
		stroke-linecap: round;
		stroke-dasharray: 2 7;
	}
	/* Ka'bah selalu hitam berkiswah, di mode terang maupun gelap */
	.kaaba {
		fill: #1c2530;
		stroke: rgba(255, 255, 255, 0.12);
	}
	.kband {
		fill: var(--gold);
	}
	.hub {
		fill: var(--navy);
		stroke: var(--card);
		stroke-width: 3;
	}
	.read {
		margin-top: 18px;
	}
	.deg {
		font-size: 44px;
		font-weight: 500;
		line-height: 1;
		color: var(--ink);
	}
	.sub {
		font-size: 13px;
		color: var(--ink2);
		margin-top: 6px;
	}
	.status {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		margin-top: 14px;
		padding: 8px 14px;
		border-radius: 999px;
		background: var(--sunk);
		font-size: 13px;
		font-weight: 700;
		color: var(--ink2);
	}
	.status.ok {
		background: var(--peach-soft);
		color: var(--peach-ink);
	}
	.status.none {
		display: block;
		border-radius: 14px;
		font-weight: 600;
		line-height: 1.5;
		margin-bottom: 0;
	}
	.btn {
		margin-top: 16px;
		width: 100%;
		height: 46px;
		border-radius: 14px;
		background: var(--navy);
		color: var(--on-navy);
		font-weight: 700;
		font-size: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}
	.facts {
		display: grid;
		grid-template-columns: 1fr 1fr;
		margin-top: 12px;
		padding: 14px 16px;
		gap: 12px;
	}
	.fact {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}
	.v {
		font-weight: 700;
		font-size: 14.5px;
		color: var(--ink);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.tips {
		display: flex;
		gap: 14px;
		align-items: flex-start;
		margin-top: 12px;
		padding: 14px 16px;
	}
	.tips p {
		margin: 3px 0 0;
		font-size: 12.5px;
		line-height: 1.5;
		color: var(--ink2);
	}
	.tips .v {
		white-space: normal;
	}
	.tips.warn {
		background: var(--peach-wash);
		border-color: var(--peach-line);
	}
	.tips.warn .v {
		color: var(--peach-ink);
	}
	.eight {
		width: 44px;
		height: 26px;
		flex: none;
		margin-top: 2px;
		fill: none;
		stroke: var(--navy);
		stroke-width: 2.2;
		stroke-linecap: round;
		stroke-dasharray: 6 4;
		animation: trace 2.4s linear infinite;
	}
	@keyframes trace {
		to {
			stroke-dashoffset: -40;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.eight {
			animation: none;
		}
		.dial {
			transition: none;
		}
	}
</style>
