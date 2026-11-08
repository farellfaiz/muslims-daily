import { formatTime } from './date.ts';
import { PRAYERS, type DayTimes, type PrayerKey } from './prayer.ts';

/**
 * Notifikasi adzan.
 *
 * Aplikasi ini tanpa server, jadi notifikasi dijadwalkan di perangkat sendiri: selama aplikasi
 * masih hidup (terbuka atau berjalan di latar), jam diperiksa berkala dan notifikasi dimunculkan
 * lewat service worker begitu waktu salat masuk.
 */

export interface AdzanPrefs {
	/** sakelar utama; baru bisa nyala setelah izin notifikasi diberikan */
	enabled: boolean;
	/** notifikasi per waktu salat */
	on: Record<PrayerKey, boolean>;
	/** pengingat sekian menit sebelum adzan (0 = tidak ada) */
	before: number;
}

export const BEFORE_OPTIONS = [0, 5, 10, 15] as const;

/** Notifikasi yang terlambat lebih dari ini (HP tertidur, tab dibekukan) tidak dimunculkan lagi. */
export const LATE_LIMIT = 10 * 60e3;

export function defaultAdzanPrefs(): AdzanPrefs {
	return { enabled: false, on: { subuh: true, dzuhur: true, ashar: true, maghrib: true, isya: true }, before: 0 };
}

export interface Alert {
	key: PrayerKey;
	name: string;
	kind: 'adzan' | 'before';
	/** kapan notifikasi dimunculkan */
	at: Date;
	/** waktu salatnya */
	prayerAt: Date;
}

/** Semua notifikasi untuk satu hari, urut waktu, sesuai pengaturan. */
export function alertsFor(day: DayTimes, prefs: AdzanPrefs): Alert[] {
	if (!prefs.enabled) return [];
	const out: Alert[] = [];
	for (const p of PRAYERS) {
		if (!prefs.on[p.key]) continue;
		const prayerAt = day[p.key];
		if (prefs.before > 0) out.push({ ...p, kind: 'before', at: new Date(+prayerAt - prefs.before * 60e3), prayerAt });
		out.push({ ...p, kind: 'adzan', at: prayerAt, prayerAt });
	}
	return out.sort((a, b) => +a.at - +b.at);
}

/**
 * Notifikasi yang jatuh tempo di rentang (from, to]: sudah lewat sejak pemeriksaan terakhir,
 * tapi belum terlalu terlambat.
 */
export function dueAlerts(alerts: Alert[], from: Date, to: Date, lateLimit = LATE_LIMIT): Alert[] {
	return alerts.filter((a) => +a.at > +from && +a.at <= +to && +to - +a.at <= lateLimit);
}

/** Notifikasi terdekat setelah "now", dari jadwal hari ini lalu besok. */
export function nextAlert(now: Date, today: DayTimes, tomorrow: DayTimes, prefs: AdzanPrefs): Alert | null {
	for (const day of [today, tomorrow]) {
		const a = alertsFor(day, prefs).find((x) => x.at > now);
		if (a) return a;
	}
	return null;
}

/** Tag unik per notifikasi, supaya notifikasi yang sama tidak muncul dua kali. */
export function alertTag(a: Alert): string {
	const d = a.prayerAt;
	return `adzan-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}-${a.key}-${a.kind}`;
}

export function alertText(a: Alert, place: string, minutesBefore: number): { title: string; body: string } {
	const time = formatTime(a.prayerAt);
	if (a.kind === 'before') {
		return { title: `${a.name} ${minutesBefore} menit lagi`, body: `Adzan ${a.name} pukul ${time} · ${place}` };
	}
	return { title: `Waktu ${a.name}`, body: `Sudah masuk waktu ${a.name}, pukul ${time} · ${place}` };
}

export type NotifSupport = 'ok' | 'unsupported' | 'ios-install';

/**
 * Apakah browser ini bisa menampilkan notifikasi.
 * iPhone/iPad hanya mengizinkan notifikasi web untuk aplikasi yang sudah dipasang di layar utama.
 */
export function notifSupport(hasNotification: boolean, hasServiceWorker: boolean, isIos: boolean, standalone: boolean): NotifSupport {
	if (isIos && !standalone) return 'ios-install';
	if (!hasNotification || !hasServiceWorker) return 'unsupported';
	return 'ok';
}
