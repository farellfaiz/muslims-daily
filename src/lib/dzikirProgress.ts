import { addDays, dateKey } from './date.ts';
import { PRAYERS, type DayTimes, type PrayerKey } from './prayer.ts';

/**
 * Hitungan dzikir. Setiap sesi punya tanggalnya sendiri:
 * - setelah salat: satu sesi per salat (subuh ... isya),
 * - dzikir pagi dan petang: sesi 'pagi' dan 'petang'.
 * Begitu tanggal sesi berganti, hitungannya mulai dari nol.
 */
export type Session = PrayerKey | 'pagi' | 'petang';
export type DzikirSet = 'salat' | 'pagi-petang';

export type DzikirProgress = Partial<Record<Session, { date: string; n: Record<number, number> }>>;

export const emptyProgress = (): DzikirProgress => ({});

/** Hitungan sesi untuk tanggal ini (kosong bila tersimpan dari hari lain). */
export function counts(p: DzikirProgress, session: Session, date: string): Record<number, number> {
	const s = p[session];
	return s && s.date === date ? s.n : {};
}

/** Satu ketukan. Tidak melewati jumlah bacaan. */
export function tap(p: DzikirProgress, session: Session, date: string, id: number, max: number): DzikirProgress {
	const cur = counts(p, session, date);
	return { ...p, [session]: { date, n: { ...cur, [id]: Math.min(max, (cur[id] ?? 0) + 1) } } };
}

export function resetSession(p: DzikirProgress, session: Session, date: string): DzikirProgress {
	return { ...p, [session]: { date, n: {} } };
}

export function doneCount(p: DzikirProgress, session: Session, date: string, items: { id: number; count: number }[]) {
	const cur = counts(p, session, date);
	return items.filter((d) => (cur[d.id] ?? 0) >= d.count).length;
}

/**
 * Salat terakhir yang waktunya sudah masuk, beserta tanggal harinya.
 * Dini hari sebelum Subuh masih terhitung "setelah Isya" hari kemarin.
 */
export function afterPrayer(now: Date, today: DayTimes): { prayer: PrayerKey; date: string } {
	for (const p of [...PRAYERS].reverse()) if (now >= today[p.key]) return { prayer: p.key, date: dateKey(now) };
	return { prayer: 'isya', date: dateKey(addDays(now, -1)) };
}

/** Pagi dari Subuh sampai sebelum Ashar, petang dari Ashar sampai sebelum Subuh berikutnya. */
export function pagiPetang(now: Date, t: DayTimes): 'pagi' | 'petang' {
	return now >= t.subuh && now < t.ashar ? 'pagi' : 'petang';
}

/** Lama "selepas salat" untuk menyarankan dzikir setelah salat. */
export const AFTER_SALAT_MIN = 45;

/**
 * Set yang dibuka saat halaman dzikir dibuka:
 * - sampai 45 menit setelah masuk waktu salat: dzikir setelah salat,
 * - Subuh sampai Dzuhur dan Ashar sampai Maghrib selebihnya: dzikir pagi dan petang,
 * - di luar itu: dzikir setelah salat.
 */
export function suggestedSet(now: Date, t: DayTimes): DzikirSet {
	const last = PRAYERS.map((p) => t[p.key])
		.filter((at) => now >= at)
		.pop();
	if (last && +now - +last < AFTER_SALAT_MIN * 60e3) return 'salat';
	if ((now >= t.subuh && now < t.dzuhur) || (now >= t.ashar && now < t.maghrib)) return 'pagi-petang';
	return 'salat';
}
