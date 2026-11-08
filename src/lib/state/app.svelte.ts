import { DEFAULT_CITY } from '#lib/cities.ts';
import { addDays } from '#lib/date.ts';
import { IMSAK_MINUTES, timesFor, type Adjust, type DayTimes, type MadhabKey, type MethodKey } from '#lib/prayer.ts';
import { emptyTracker, type TrackerData } from '#lib/tracker.ts';
import { emptyProgress, type DzikirProgress } from '#lib/dzikirProgress.ts';
import { Persisted } from './persisted.svelte.ts';
import type { SalatVersi } from '#lib/salatVersi.ts';

export interface Settings {
	/** id kota dari daftar, atau 'gps' bila memakai lokasi perangkat */
	place: string;
	label: string;
	lat: number;
	lng: number;
	method: MethodKey;
	madhab: MadhabKey;
	/** koreksi manual per salat, dalam menit */
	adjust: Adjust;
	/** menit imsak sebelum Subuh */
	imsak: number;
}

export interface DoaPrefs {
	view: 'card' | 'list';
	sort: 'kat' | 'az' | 'short' | 'long';
	favs: number[];
	/** doa yang ditandai sudah dibaca, per tanggal (hanya hari ini yang dipakai) */
	readOn: string;
	read: number[];
}

export interface ReadingPrefs {
	lat: boolean;
	tr: boolean;
	wbw: boolean;
	size: number;
}

export const settings = new Persisted<Settings>('settings', {
	place: DEFAULT_CITY.id,
	label: DEFAULT_CITY.name,
	lat: DEFAULT_CITY.lat,
	lng: DEFAULT_CITY.lng,
	method: 'kemenag',
	madhab: 'syafii',
	adjust: {},
	imsak: IMSAK_MINUTES
});

export const tracker = new Persisted<TrackerData>('tracker', emptyTracker());

export const doaPrefs = new Persisted<DoaPrefs>('doa', {
	view: 'card',
	sort: 'kat',
	favs: [],
	readOn: '',
	read: []
});

export const reading = new Persisted<ReadingPrefs>('reading', { lat: true, tr: true, wbw: false, size: 30 });

/** Posisi terakhir membaca Al-Qur'an: surat dan ayat (0 = belum pernah). */
export const quranLast = new Persisted<{ s: number; a: number }>('quran', { s: 0, a: 0 });

/** Versi dzikir setelah salat yang dipilih pengguna. */
export const dzikirPrefs = new Persisted<{ salat: SalatVersi }>('dzikirPrefs', { salat: 'azhar' });

/** Hitungan dzikir pagi dan petang hari ini. */
export const dzikirProgress = new Persisted<DzikirProgress>('dzikir', emptyProgress());

export type ThemeMode = 'system' | 'light' | 'dark';
/** Tema tampilan. 'system' mengikuti pengaturan HP. Dibaca juga oleh skrip kecil di app.html. */
export const theme = new Persisted<{ mode: ThemeMode }>('theme', { mode: 'light' });

/** Kapan terakhir pengguna menyimpan file cadangan (ISO). Kosong = belum pernah. */
export const backupMeta = new Persisted<{ lastAt: string }>('backup', { lastAt: '' });

/**
 * Jam bersama untuk seluruh aplikasi. Null saat prerender (server tidak tahu jam pengguna),
 * lalu terisi begitu halaman hidup di browser. Berdetak tiap detik hanya saat tab terlihat.
 */
class Clock {
	now = $state<Date | null>(null);
	#timer: ReturnType<typeof setInterval> | undefined;

	start() {
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
export const clock = new Clock();

/** Jadwal satu hari memakai pengaturan pengguna (lokasi, metode, mazhab, koreksi manual). */
export function timesForDay(date: Date, s: Settings = settings.value): DayTimes {
	return timesFor(date, s.lat, s.lng, s.method, s.madhab, s.adjust);
}

/** Jadwal kemarin, hari ini, dan besok, dihitung ulang hanya saat tanggal atau pengaturan berubah. */
let cacheKey = '';
let cache: { yesterday: DayTimes; today: DayTimes; tomorrow: DayTimes } | null = null;
export function schedule(now: Date) {
	const s = settings.value;
	const key = `${now.toDateString()}|${s.lat}|${s.lng}|${s.method}|${s.madhab}|${JSON.stringify(s.adjust)}`;
	if (key !== cacheKey || !cache) {
		cacheKey = key;
		cache = {
			yesterday: timesForDay(addDays(now, -1), s),
			today: timesForDay(now, s),
			tomorrow: timesForDay(addDays(now, 1), s)
		};
	}
	return cache;
}

/** Notifikasi kecil di bawah layar. */
class Toast {
	msg = $state('');
	show = $state(false);
	#h: ReturnType<typeof setTimeout> | undefined;
	say(msg: string) {
		this.msg = msg;
		this.show = true;
		clearTimeout(this.#h);
		this.#h = setTimeout(() => (this.show = false), 1900);
	}
}
export const toast = new Toast();
