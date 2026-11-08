import { DEFAULT_PLACE, heroArc, nextPrayer, schedule, skyPhase, visitorPlace, type Place } from './sky.ts';

/**
 * Jam bersama untuk langit di hero dan ajakan penutup.
 * Null saat prerender (server tidak tahu jam pengunjung), lalu berdetak tiap detik
 * hanya selama tab terlihat.
 */
class Live {
	now = $state<Date | null>(null);
	place = $state<Place>(DEFAULT_PLACE);
	#timer: ReturnType<typeof setInterval> | undefined;

	times = $derived(this.now ? schedule(this.now, this.place) : null);
	phase = $derived(this.now && this.times ? skyPhase(this.now, this.times.today) : null);
	next = $derived(this.now && this.times ? nextPrayer(this.now, this.times.today, this.times.tomorrow) : null);
	arc = $derived(
		this.now && this.times ? heroArc(this.now, this.times.yesterday, this.times.today, this.times.tomorrow) : null
	);

	start() {
		this.place = visitorPlace();
		const tick = () => (this.now = new Date());
		const run = () => {
			clearInterval(this.#timer);
			if (document.visibilityState === 'visible') {
				tick();
				this.#timer = setInterval(tick, 1000);
			}
		};
		run();
		document.addEventListener('visibilitychange', run);
		return () => {
			clearInterval(this.#timer);
			document.removeEventListener('visibilitychange', run);
		};
	}
}

export const live = new Live();
