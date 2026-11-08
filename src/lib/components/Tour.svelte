<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Icon from './Icon.svelte';
	import Sheet from './Sheet.svelte';
	import { tour } from '#lib/state/tour.svelte.ts';
	import { cardTop, spotlight, type Box } from '#lib/tour.ts';
	import { isEn, tr } from '#lib/i18n.svelte.ts';

	// Tawaran: muncul sekali di beranda saat aplikasi pertama dibuka, setelah halaman sempat tampil.
	let offerOpen = $state(false);
	// Tunggu splash hilang dulu: lembar <dialog> tampil di lapisan paling atas, bisa menimpa splash.
	$effect(() => {
		if (!tour.offer || page.url.pathname !== '/') return;
		let t = 0;
		const show = () => (t = window.setTimeout(() => (offerOpen = true), 700));
		if (window.__splashGone) show();
		else addEventListener('splash:gone', show, { once: true });
		return () => {
			clearTimeout(t);
			removeEventListener('splash:gone', show);
		};
	});
	let wasOpen = false;
	$effect(() => {
		// Lembar ditutup tanpa memilih Mulai (tombol x, Esc, ketuk latar) = nanti saja.
		if (wasOpen && !offerOpen && !tour.active) tour.decline();
		wasOpen = offerOpen;
	});
	function begin() {
		tour.start();
		offerOpen = false;
	}

	// Sorotan: cari elemen langkah ini (pindah halaman dulu bila perlu), gulir ke tengah, lalu ukur terus.
	let el = $state<HTMLElement | null>(null);
	let spot = $state<Box | null>(null);
	let view = $state({ w: 0, h: 0, inset: 0 });
	let cardH = $state(0);
	let nextBtn = $state<HTMLButtonElement>();

	$effect(() => {
		if (!tour.active) {
			el = null;
			spot = null;
			return;
		}
		const step = tour.current;
		let cancelled = false;
		el = null;
		(async () => {
			if (step.route && page.url.pathname !== step.route) await goto(step.route);
			const started = performance.now();
			let found: HTMLElement | null = null;
			while (!cancelled && !found && performance.now() - started < 3000) {
				found = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
				if (!found) await new Promise((r) => setTimeout(r, 60));
			}
			if (cancelled) return;
			// Elemen tidak ada (mis. tampilan berubah): lewati langkah ini daripada tour macet.
			if (!found) return tour.next();
			const r = found.getBoundingClientRect();
			const fixed = getComputedStyle(found).position === 'fixed';
			if (!fixed && (r.top < 80 || r.bottom > innerHeight - 160)) {
				found.scrollIntoView({ block: r.height > innerHeight * 0.5 ? 'start' : 'center', behavior: 'smooth' });
			}
			el = found;
			nextBtn?.focus({ preventScroll: true });
		})();
		return () => (cancelled = true);
	});

	// Ukur tiap frame selama tour berjalan: ikut gulir, animasi, dan perubahan ukuran layar.
	$effect(() => {
		if (!tour.active || !el) return;
		const target = el;
		let raf = 0;
		const loop = () => {
			const nav = document.querySelector('[data-tour="nav"]')?.getBoundingClientRect();
			const inset = nav && target.dataset.tour !== 'nav' ? innerHeight - nav.top : 0;
			view = { w: innerWidth, h: innerHeight, inset };
			const r = target.getBoundingClientRect();
			spot = spotlight({ top: r.top, left: r.left, width: r.width, height: r.height }, innerWidth, innerHeight);
			raf = requestAnimationFrame(loop);
		};
		loop();
		return () => cancelAnimationFrame(raf);
	});

	const top = $derived(spot && cardH ? cardTop(spot, cardH, view.h, view.inset) : null);
	const last = $derived(tour.step === tour.total - 1);

	function done() {
		tour.finish();
		if (page.url.pathname !== '/') goto('/');
	}

	function onKey(e: KeyboardEvent) {
		if (!tour.active) return;
		if (e.key === 'Escape') tour.stop();
		else if (e.key === 'ArrowRight') last ? done() : tour.next();
		else if (e.key === 'ArrowLeft') tour.back();
	}
</script>

<svelte:window onkeydown={onKey} />

<Sheet bind:open={offerOpen} title="Assalamu'alaikum">
	<div class="offer">
		<img src="/icons/icon-192.png" alt="" width="64" height="64" />
		<p class="ot">{tr('Baru pertama buka Muslims Daily?', 'New to Muslims Daily?')}</p>
		<p class="os">
			{tr(
				'Ikut tour singkat yuk, biar langsung kenal fitur-fiturnya. Cuma sekitar satu menit.',
				'Take a quick tour to get to know the features. It only takes about a minute.'
			)}
		</p>
		<button class="go press" onclick={begin}>{tr('Mulai tour', 'Start tour')}</button>
		<button class="later press" onclick={() => (offerOpen = false)}>{tr('Nanti aja', 'Maybe later')}</button>
		<p class="hint">{tr('Tour bisa dibuka lagi kapan saja dari menu Lainnya.', 'You can open the tour again anytime from More.')}</p>
	</div>
</Sheet>

{#if tour.active}
	<div class="tour" role="dialog" aria-modal="true" aria-label={tr('Tour aplikasi', 'App tour')}>
		{#if spot}
			<div
				class="spot"
				style:top="{spot.top}px"
				style:left="{spot.left}px"
				style:width="{spot.width}px"
				style:height="{spot.height}px"
			></div>
		{:else}
			<div class="dim"></div>
		{/if}

		<div class="card tip" class:shown={top !== null} bind:clientHeight={cardH} style:top="{top ?? view.h}px" aria-live="polite">
			<div class="th">
				<span class="label num">{tour.step + 1} / {tour.total}</span>
				<button class="skip" onclick={() => tour.stop()}>{tr('Lewati', 'Skip')}</button>
			</div>
			<h2 class="disp">{isEn() ? tour.current.titleEn : tour.current.title}</h2>
			<p>{isEn() ? tour.current.bodyEn : tour.current.body}</p>
			<div class="tf">
				<div class="dots" aria-hidden="true">
					{#each { length: tour.total } as _, i (i)}<span class:on={i === tour.step}></span>{/each}
				</div>
				{#if tour.step > 0}
					<button class="nav-b press" aria-label={tr('Sebelumnya', 'Previous')} onclick={() => tour.back()}><Icon name="back" size={16} stroke={2.2} /></button>
				{/if}
				<button class="next press" bind:this={nextBtn} onclick={() => (last ? done() : tour.next())}>
					{last ? tr('Selesai', 'Done') : tr('Lanjut', 'Next')}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.offer {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 4px 4px 8px;
	}
	.offer img {
		border-radius: 18px;
		margin-bottom: 14px;
	}
	.ot {
		margin: 0;
		font-family: var(--f-disp);
		font-size: 21px;
		font-weight: 600;
		color: var(--ink);
	}
	.os {
		margin: 8px 0 20px;
		font-size: 14px;
		line-height: 1.55;
		color: var(--ink2);
		max-width: 300px;
	}
	.go,
	.later {
		width: 100%;
		height: 48px;
		border-radius: 16px;
		font-size: 15px;
		font-weight: 700;
	}
	.go {
		background: var(--navy);
		color: var(--on-navy);
	}
	.later {
		margin-top: 8px;
		background: var(--sunk);
		color: var(--ink);
	}
	.hint {
		margin: 12px 0 0;
		font-size: 12px;
		color: var(--ink3);
	}

	.tour {
		position: fixed;
		inset: 0;
		z-index: 50;
	}
	.dim {
		position: absolute;
		inset: 0;
		background: rgb(10 20 35 / 0.55);
	}
	/* Lubang sorotan: bayangan raksasa menggelapkan semua kecuali kotak ini. */
	.spot {
		position: absolute;
		border-radius: 20px;
		box-shadow:
			0 0 0 2px var(--peach-sun),
			0 0 0 200vmax rgb(10 20 35 / 0.55);
		transition:
			top 0.35s var(--ease),
			left 0.35s var(--ease),
			width 0.35s var(--ease),
			height 0.35s var(--ease);
		pointer-events: none;
	}
	.tip {
		position: absolute;
		left: 50%;
		width: min(398px, calc(100% - 32px));
		transform: translateX(-50%) translateY(6px);
		padding: 16px 16px 14px;
		opacity: 0;
		transition:
			top 0.35s var(--ease),
			opacity 0.25s,
			transform 0.35s var(--ease);
	}
	.tip.shown {
		opacity: 1;
		transform: translateX(-50%);
	}
	.th {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.skip {
		font-size: 13px;
		font-weight: 700;
		color: var(--ink2);
		padding: 4px 2px;
	}
	.tip h2 {
		margin: 6px 0 4px;
		font-size: 20px;
	}
	.tip p {
		margin: 0;
		font-size: 14px;
		line-height: 1.55;
		color: var(--ink2);
	}
	.tf {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 14px;
	}
	.dots {
		flex: 1;
		display: flex;
		gap: 5px;
	}
	.dots span {
		width: 6px;
		height: 6px;
		border-radius: 99px;
		background: var(--line-strong);
		transition: width 0.3s var(--ease);
	}
	.dots span.on {
		width: 18px;
		background: var(--peach);
	}
	.nav-b {
		width: 42px;
		height: 42px;
		border-radius: 14px;
		display: grid;
		place-items: center;
		background: var(--sunk);
		color: var(--ink);
	}
	.next {
		height: 42px;
		padding: 0 22px;
		border-radius: 14px;
		background: var(--navy);
		color: var(--on-navy);
		font-size: 14px;
		font-weight: 700;
	}
	@media (prefers-reduced-motion: reduce) {
		.spot,
		.tip {
			transition: none;
		}
	}
</style>
