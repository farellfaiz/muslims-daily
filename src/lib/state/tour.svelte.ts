import { TOUR_STEPS } from '#lib/tour.ts';
import { Persisted } from './persisted.svelte.ts';

/** Sudah pernah ditawari tour (dimulai atau ditolak), supaya tawaran tidak muncul lagi. */
const seen = new Persisted<{ offered: boolean; done: boolean }>('tour', { offered: false, done: false });

/**
 * Tour aplikasi. Ditawarkan sekali di langkah terakhir onboarding; bisa diulang dari Lainnya.
 * Langkahnya ada di #lib/tour.ts, sorotannya digambar Tour.svelte.
 */
class Tour {
	/** false selama prerender, supaya onboarding tidak berkedip */
	ready = $state(false);
	active = $state(false);
	step = $state(0);

	/** Pengguna baru: belum pernah melewati onboarding (dipakai +layout.svelte untuk menampilkannya). */
	get offer() {
		return this.ready && !this.active && !seen.value.offered;
	}
	get total() {
		return TOUR_STEPS.length;
	}
	get current() {
		return TOUR_STEPS[this.step];
	}

	start() {
		seen.value = { ...seen.value, offered: true };
		this.step = 0;
		this.active = true;
	}
	/** Tolak tawaran: tidak ditawarkan lagi, tetap bisa dibuka dari Lainnya. */
	decline() {
		seen.value = { ...seen.value, offered: true };
	}
	next() {
		if (this.step < TOUR_STEPS.length - 1) this.step++;
		else this.finish();
	}
	back() {
		if (this.step > 0) this.step--;
	}
	finish() {
		this.active = false;
		seen.value = { offered: true, done: true };
	}
	/** Keluar di tengah jalan. */
	stop() {
		this.active = false;
	}
}

export const tour = new Tour();
