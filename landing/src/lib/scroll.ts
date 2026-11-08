/**
 * Mesin gulir kecil: satu listener scroll/resize untuk seluruh halaman, digabung per frame
 * (requestAnimationFrame). Komponen mendaftar fungsi `frame` dan menulis style langsung ke
 * elemen (transform, opacity), jadi tidak ada render ulang Svelte di setiap frame.
 */
type Frame = () => void;
const frames = new Set<Frame>();
let queued = false;

function flush() {
	queued = false;
	for (const f of frames) f();
}
function queue() {
	if (!queued) {
		queued = true;
		requestAnimationFrame(flush);
	}
}

/** Minta satu frame lagi, untuk animasi yang masih berjalan setelah gulirnya berhenti. */
export const requestFrame = queue;

export function onFrame(f: Frame) {
	if (!frames.size) {
		addEventListener('scroll', queue, { passive: true });
		addEventListener('resize', queue);
	}
	frames.add(f);
	queue();
	return () => {
		frames.delete(f);
		if (!frames.size) {
			removeEventListener('scroll', queue);
			removeEventListener('resize', queue);
		}
	};
}

/**
 * Penulis style yang hanya menyentuh DOM bila nilainya benar-benar berubah.
 * Sebagian besar nilai adegan diam di 0 atau 1, jadi ini memangkas banyak pekerjaan browser per frame.
 */
export function styler() {
	const seen = new WeakMap<Element, Map<string, string>>();
	return (el: HTMLElement | SVGElement, prop: string, value: string) => {
		let m = seen.get(el);
		if (!m) seen.set(el, (m = new Map()));
		if (m.get(prop) === value) return;
		m.set(prop, value);
		el.style.setProperty(prop, value);
	};
}

export const motionOn =() => document.documentElement.classList.contains('motion');

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
/** Posisi v di rentang [a, b], dijepit ke 0..1. */
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Action: tambah kelas `in` saat elemen pertama kali masuk layar (pasangan dari `.rv` di app.css). */
export function reveal(node: HTMLElement) {
	if (!motionOn() || !('IntersectionObserver' in window)) {
		node.classList.add('in');
		return;
	}
	const io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (e.isIntersecting) {
					node.classList.add('in');
					io.disconnect();
				}
			}
		},
		{ rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
	);
	io.observe(node);
	return { destroy: () => io.disconnect() };
}
