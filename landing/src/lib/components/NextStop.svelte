<script lang="ts">
	import { onMount } from 'svelte';
	import { tr } from '#lib/i18n.svelte.ts';
	import { clamp, motionOn, onFrame, smooth } from '#lib/scroll.ts';
	import Icon from './Icon.svelte';

	/*
		Tombol "Lanjut": membawa pengunjung tepat ke titik berhenti berikutnya, yaitu elemen ber-[data-stop].
		Durasinya diatur sendiri (bukan scroll smooth bawaan browser) supaya adegan panjang tidak lewat terlalu cepat.
		`scroll-margin-top` pada elemen dihitung, untuk titik yang perlu jarak dari nav.
	*/
	const TOLERANCE = 8;

	let btn = $state<HTMLButtonElement>();
	let visible = $state(false);
	let last = Infinity;
	let tween: { to: number; raf: number } | null = null;

	function stops() {
		const max = document.documentElement.scrollHeight - innerHeight;
		return [...document.querySelectorAll<HTMLElement>('[data-stop]')]
			.filter((el) => el.getClientRects().length > 0)
			.map((el) => {
				const top = el.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(el).scrollMarginTop);
				return Math.min(max, Math.round(top));
			})
			.sort((a, b) => a - b);
	}

	function cancel() {
		if (tween) cancelAnimationFrame(tween.raf);
		tween = null;
	}

	function next() {
		// Ditekan lagi saat masih bergerak: lanjut dari tujuan yang sedang dituju.
		const base = tween ? tween.to : scrollY;
		const to = stops().find((y) => y > base + TOLERANCE);
		if (to === undefined) return;
		cancel();
		if (!motionOn()) {
			scrollTo({ top: to, behavior: 'instant' });
			return;
		}
		const from = scrollY;
		const start = performance.now();
		const duration = clamp(Math.abs(to - from) * 0.7 + 300, 700, 1600);
		const step = (now: number) => {
			if (!tween) return;
			const p = clamp((now - start) / duration);
			scrollTo({ top: from + (to - from) * smooth(p), behavior: 'instant' });
			if (p < 1) tween.raf = requestAnimationFrame(step);
			else tween = null;
		};
		tween = { to, raf: requestAnimationFrame(step) };
	}

	onMount(() => {
		const measure = () => {
			last = stops().at(-1) ?? Infinity;
		};
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(document.body);

		// Pengunjung ikut menggulir sendiri: tombol mengalah.
		const yieldTo = (e: Event) => {
			if (!btn?.contains(e.target as Node)) cancel();
		};
		addEventListener('wheel', yieldTo, { passive: true });
		addEventListener('pointerdown', yieldTo, { passive: true });
		addEventListener('keydown', yieldTo);

		const stopFrame = onFrame(() => {
			const v = scrollY < last - TOLERANCE;
			if (v !== visible) visible = v;
		});
		return () => {
			cancel();
			ro.disconnect();
			stopFrame();
			removeEventListener('wheel', yieldTo);
			removeEventListener('pointerdown', yieldTo);
			removeEventListener('keydown', yieldTo);
		};
	});
</script>

<button class="next" class:visible bind:this={btn} onclick={next} aria-label={tr('Lanjut ke bagian berikutnya', 'Go to the next section')}>
	<span class="word">{tr('Lanjut', 'Next')}</span>
	<Icon name="chevronDown" size={18} stroke={2.2} />
</button>

<style>
	.next {
		position: fixed;
		z-index: 40;
		right: max(var(--gutter), env(safe-area-inset-right));
		bottom: calc(16px + env(safe-area-inset-bottom));
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 46px;
		padding: 0 14px 0 18px;
		border-radius: 999px;
		background: var(--card);
		color: var(--ink);
		font-size: 14px;
		font-weight: 700;
		box-shadow:
			inset 0 0 0 1px var(--line-strong),
			var(--shadow-lg);
		opacity: 0;
		visibility: hidden;
		transform: translate3d(0, 12px, 0);
		transition:
			opacity 0.3s var(--ease),
			transform 0.3s var(--ease),
			visibility 0s linear 0.3s;
	}
	.next.visible {
		opacity: 1;
		visibility: visible;
		transform: none;
		transition:
			opacity 0.3s var(--ease),
			transform 0.3s var(--ease),
			visibility 0s;
	}
	.next.visible:active {
		transform: scale(0.96);
	}
	@media (hover: hover) {
		.next.visible:hover {
			transform: translateY(-2px);
		}
	}
	/* Di HP cukup ikon: versi berlabel menutupi hitung mundur di pintu hero. */
	@media (max-width: 899px) {
		.next {
			right: max(10px, env(safe-area-inset-right));
			justify-content: center;
			width: 44px;
			height: 44px;
			padding: 0;
		}
		.word {
			display: none;
		}
	}
</style>
