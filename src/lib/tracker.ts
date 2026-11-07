import { addDays, dateKey, fromKey } from './date.ts';
import { PRAYERS, type PrayerKey } from './prayer.ts';

/**
 * Catatan salat sengaja sederhana: sudah salat atau belum.
 * (Status tepat waktu / terlambat pernah dirancang, lalu dibuang atas permintaan pemilik:
 * tracker ini untuk menjaga kebiasaan, bukan menilai.)
 */
export type DayLog = Partial<Record<PrayerKey, true>>;

export interface TrackerData {
	logs: Record<string, DayLog>;
	/** Hari udzur yang sudah selesai (haid atau nifas). */
	udzurDays: string[];
	/** Mode udzur sedang aktif sejak tanggal ini (inklusif). */
	udzurSince: string | null;
}

export const emptyTracker = (): TrackerData => ({ logs: {}, udzurDays: [], udzurSince: null });

export function isUdzur(d: TrackerData, key: string, todayKey: string): boolean {
	if (d.udzurDays.includes(key)) return true;
	return d.udzurSince !== null && key >= d.udzurSince && key <= todayKey;
}

export function prayedCount(log: DayLog | undefined): number {
	return log ? PRAYERS.filter((p) => log[p.key]).length : 0;
}

/** Hari lengkap = kelima salat tercatat. */
export const isComplete = (log: DayLog | undefined) => prayedCount(log) === PRAYERS.length;

function earliestKey(d: TrackerData): string | null {
	const keys = [...Object.keys(d.logs), ...d.udzurDays, ...(d.udzurSince ? [d.udzurSince] : [])];
	return keys.length ? keys.sort()[0] : null;
}

/**
 * Streak = jumlah hari lengkap berturut-turut sampai hari ini.
 * - Hari ini yang belum lengkap tidak memutus streak (harinya belum selesai).
 * - Hari udzur dilewati: tidak menambah, tidak memutus.
 */
export function currentStreak(d: TrackerData, today: Date): number {
	const todayKey = dateKey(today);
	const first = earliestKey(d);
	if (!first) return 0;
	let n = 0;
	for (let day = today; dateKey(day) >= first; day = addDays(day, -1)) {
		const k = dateKey(day);
		if (isUdzur(d, k, todayKey)) continue;
		if (isComplete(d.logs[k])) n++;
		else if (k !== todayKey) break;
	}
	return n;
}

export function bestStreak(d: TrackerData, today: Date): number {
	const todayKey = dateKey(today);
	const first = earliestKey(d);
	if (!first) return 0;
	let best = 0;
	let run = 0;
	for (let day = fromKey(first); dateKey(day) <= todayKey; day = addDays(day, 1)) {
		const k = dateKey(day);
		if (isUdzur(d, k, todayKey)) continue;
		if (isComplete(d.logs[k])) best = Math.max(best, ++run);
		else if (k !== todayKey) run = 0;
	}
	return best;
}

export interface HeatCell {
	key: string;
	date: Date;
	value: number; // 0 sampai 5
	log: DayLog;
	udzur: boolean;
	future: boolean;
}

/** Grid ala kontribusi GitHub: kolom = minggu (Senin di atas), kolom terakhir = minggu ini. */
export function heatmap(d: TrackerData, today: Date, weeks: number): HeatCell[][] {
	const todayKey = dateKey(today);
	const mondayOffset = (today.getDay() + 6) % 7;
	const start = addDays(today, -mondayOffset - (weeks - 1) * 7);
	const cols: HeatCell[][] = [];
	for (let w = 0; w < weeks; w++) {
		const col: HeatCell[] = [];
		for (let i = 0; i < 7; i++) {
			const date = addDays(start, w * 7 + i);
			const key = dateKey(date);
			col.push({
				key,
				date,
				value: prayedCount(d.logs[key]),
				log: d.logs[key] ?? {},
				udzur: isUdzur(d, key, todayKey),
				future: key > todayKey
			});
		}
		cols.push(col);
	}
	return cols;
}

/**
 * Konsistensi per salat: persentase hari (dalam N hari terakhir) salat itu tercatat.
 * Hari udzur dan hari sebelum pengguna mulai mencatat tidak ikut dihitung.
 */
export function consistency(d: TrackerData, today: Date, days = 30): Record<PrayerKey, number | null> {
	const todayKey = dateKey(today);
	const first = earliestKey(d);
	const out = {} as Record<PrayerKey, number | null>;
	for (const p of PRAYERS) {
		let counted = 0;
		let done = 0;
		for (let i = 0; i < days; i++) {
			const k = dateKey(addDays(today, -i));
			if (!first || k < first) break;
			if (isUdzur(d, k, todayKey)) continue;
			counted++;
			if (d.logs[k]?.[p.key]) done++;
		}
		out[p.key] = counted ? Math.round((done / counted) * 100) : null;
	}
	return out;
}

/** Menyalakan atau mematikan mode udzur. Saat dimatikan, rentangnya disimpan sebagai hari udzur (sampai kemarin). */
export function toggleUdzur(d: TrackerData, today: Date): TrackerData {
	const todayKey = dateKey(today);
	if (d.udzurSince === null) return { ...d, udzurSince: todayKey };
	const days = [...d.udzurDays];
	for (let day = fromKey(d.udzurSince); dateKey(day) < todayKey; day = addDays(day, 1)) {
		const k = dateKey(day);
		if (!days.includes(k)) days.push(k);
	}
	return { ...d, udzurDays: days, udzurSince: null };
}

/** Tandai sudah salat, atau batalkan bila diketuk lagi. */
export function togglePrayer(d: TrackerData, key: string, prayer: PrayerKey): TrackerData {
	const log: DayLog = { ...d.logs[key] };
	if (log[prayer]) delete log[prayer];
	else log[prayer] = true;
	const logs = { ...d.logs };
	if (Object.keys(log).length) logs[key] = log;
	else delete logs[key];
	return { ...d, logs };
}
