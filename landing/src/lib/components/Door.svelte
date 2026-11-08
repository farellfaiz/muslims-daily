<script lang="ts" module>
	// Busur kuadratik di koordinat 360x200, sama dengan hero aplikasinya.
	const [X0, X1, CX, CY, Y0] = [22, 338, 180, -30, 192];
	const PAD = 0.04;
	function arcPoint(f: number): [number, number] {
		const t = PAD + (1 - 2 * PAD) * Math.min(1, Math.max(0, f));
		const u = 1 - t;
		return [u * u * X0 + 2 * u * t * CX + t * t * X1, u * u * Y0 + 2 * u * t * CY + t * t * Y0];
	}
</script>

<script lang="ts">
	import { live } from '#lib/live.svelte.ts';
	import { countdown, DOOR_STARS, formatTime, PHASES, SKY, skyGradient } from '#lib/sky.ts';

	/*
		Pintu lengkung bawang dari ikon aplikasinya, dengan langit yang hidup:
		warna, matahari atau bulan, dan hitung mundur mengikuti jam sungguhan di kota pengunjung.
		Saat digulir, Journey memperbesar pintu ini (--inner memudarkan isi, --dawn menggeser langit ke Subuh).
	*/
	let { el = $bindable() }: { el?: HTMLElement } = $props();

	const phase = $derived(live.phase ?? 'dhuha');
	const arc = $derived(live.arc);
	const frac = (d: Date) => (arc ? (+d - +arc.start) / (+arc.end - +arc.start) : 0.5);
	const points = $derived(arc ? arc.points.map((p) => ({ ...p, pt: arcPoint(frac(p.at)) })) : []);
	const body = $derived(arcPoint(live.minute && arc ? frac(new Date(live.minute * 60000)) : 0.5));
	const isNight = $derived(arc?.mode === 'night');
	const highlight = $derived.by(() => {
		if (!arc?.lastThird) return '';
		const a = frac(arc.lastThird.from);
		const b = frac(arc.lastThird.to);
		return Array.from({ length: 25 }, (_, i) => arcPoint(a + ((b - a) * i) / 24).join(',')).join(' ');
	});
	const ink = $derived(SKY[phase].light ? '#fff' : '#33506F');
	const tz = $derived(live.place.tz);
</script>

<div class="door" bind:this={el}>
	<div class="win" style:color={ink}>
		{#each PHASES as p (p)}
			<div class="sky" class:on={p === phase} style:background={skyGradient(p)}></div>
		{/each}
		<div class="stars" class:off={!SKY[phase].stars} style:opacity={SKY[phase].stars} aria-hidden="true">
			{#each DOOR_STARS as bg, i (i)}
				<i style:background-image={bg} style:animation-delay="{i}s"></i>
			{/each}
		</div>
		<div class="inner">
			<svg class="path" viewBox="0 0 360 200" aria-hidden="true">
				<path d="M{X0} {Y0} Q{CX} {CY} {X1} {Y0}" fill="none" stroke="currentColor" stroke-opacity=".38" stroke-width="1.2" stroke-dasharray="3 5" />
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
				style:top="calc(var(--arc-top) + {body[1] * 0.27778}cqw)"
				aria-hidden="true"
			></div>
			<svg class="hill" viewBox="0 0 360 150" preserveAspectRatio="none" aria-hidden="true">
				<path d="M0 150V128C55 62 150 26 240 24C292 23 330 33 360 46V150Z" />
			</svg>
			<div class="txt" aria-live="off">
				<div class="now">{live.next ? `Menuju ${live.next.name}` : 'Jadwal salat hari ini'}</div>
				<div class="cd disp num">{live.next && live.now ? countdown(+live.next.at - +live.now) : '--:--:--'}</div>
				<div class="sub">
					{#if live.next}Pukul {formatTime(live.next.at, tz)} {live.place.zone} · {live.place.name}{:else}&nbsp;{/if}
				</div>
			</div>
		</div>
		<div class="sky dawn" style:background={skyGradient('subuh')}></div>
	</div>
</div>

<style>
	.door {
		--ogee: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpath d='M0 100V52C0 33 13 23 29 15C39 10 46 6 50 0C54 6 61 10 71 15C87 23 100 33 100 52V100Z'/%3E%3C/svg%3E");
		position: relative;
		height: 100%;
		aspect-ratio: 0.88;
		background: var(--arch);
		-webkit-mask: var(--ogee) 0 0/100% 100% no-repeat;
		mask: var(--ogee) 0 0/100% 100% no-repeat;
		transform-origin: 50% 80%;
	}
	.win {
		--arc-top: 16cqh;
		position: absolute;
		inset: 8.5% 7% 0 7%;
		overflow: hidden;
		container-type: size;
		-webkit-mask: var(--ogee) 0 0/100% 100% no-repeat;
		mask: var(--ogee) 0 0/100% 100% no-repeat;
		transition: color 1.2s;
	}
	.sky {
		position: absolute;
		inset: 0;
		opacity: 0;
		transition: opacity 1.4s var(--ease);
	}
	.sky.on {
		opacity: 1;
	}
	.sky.dawn {
		opacity: var(--dawn, 0);
		transition: none;
	}
	.stars {
		position: absolute;
		inset: 0;
		transition:
			opacity 1.4s,
			visibility 0s;
	}
	.stars.off {
		visibility: hidden;
		transition:
			opacity 1.4s,
			visibility 0s 1.4s;
	}
	.stars i {
		position: absolute;
		inset: 0;
		background-size: 100% 100%;
		will-change: opacity;
		animation: tw 3s ease-in-out infinite;
	}
	/* Bintang berhenti saat tidak terlihat: siang hari, atau pintu sudah dilewati. */
	.stars.off i,
	.door:global(.idle) .stars i {
		will-change: auto;
		animation: none;
	}
	@keyframes tw {
		50% {
			opacity: 0.25;
		}
	}
	.inner {
		position: absolute;
		inset: 0;
		opacity: var(--inner, 1);
	}
	.path {
		position: absolute;
		left: 0;
		top: var(--arc-top);
		width: 100%;
		height: auto;
		aspect-ratio: 360 / 200;
		overflow: visible;
	}
	.path text {
		font-size: 9.5px;
		font-weight: 700;
		fill: currentColor;
		fill-opacity: 0.85;
		font-family: var(--f-body);
		transition: fill-opacity 0.4s;
	}
	.path text.mk {
		font-weight: 600;
		fill-opacity: 0.7;
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
		width: 13cqw;
		height: 13cqw;
		margin: -6.5cqw 0 0 -6.5cqw;
		border-radius: 50%;
		background: var(--peach-sun);
		box-shadow: 0 0 0 3.6cqw rgba(237, 160, 125, 0.18);
		transition:
			left 1.2s var(--ease),
			top 1.2s var(--ease);
	}
	.body.moon {
		width: 9cqw;
		height: 9cqw;
		margin: -4.5cqw 0 0 -4.5cqw;
		background: #f1eee6;
		box-shadow:
			0 0 0 3cqw rgba(241, 238, 230, 0.12),
			inset -2cqw -0.9cqw 0 #d9d4c6;
	}
	.hill {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 38cqh;
		fill: var(--cream);
	}
	.txt {
		position: absolute;
		right: 6cqw;
		bottom: 5.5cqh;
		text-align: right;
		color: var(--ink);
	}
	.now {
		font-size: clamp(10px, 3.3cqw, 15px);
		font-weight: 800;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--peach-ink);
	}
	.cd {
		font-weight: 400;
		font-size: clamp(34px, 13.4cqw, 84px);
		line-height: 1;
		margin: 1.2cqw 0 1cqw;
	}
	.sub {
		font-size: clamp(11.5px, 3.6cqw, 16px);
		color: var(--ink2);
		font-weight: 600;
		min-height: 1.2em;
	}
</style>
