import { ADJUST_LIMIT, IMSAK_MINUTES, METHODS, PRAYERS, type Adjust, type MadhabKey, type MethodKey, type PrayerKey } from './prayer.ts';
import type { DayLog, TrackerData } from './tracker.ts';
import { clean as cleanKoleksi, type Koleksi } from './koleksi.ts';
import { BEFORE_OPTIONS, type AdzanPrefs } from './adzan.ts';
import type { DzikirPrefs } from './salatVersi.ts';

/**
 * Cadangan data pengguna ke satu file JSON.
 *
 * Semua data hanya ada di localStorage perangkat, jadi bila browser dibersihkan atau pindah HP,
 * riwayat salat ikut hilang. File cadangan ini disimpan sendiri oleh pengguna (tidak ada server).
 *
 * Saat dipulihkan:
 * - catatan salat dan hari udzur DIGABUNG dengan yang sudah ada (tidak ada centang yang hilang),
 * - favorit doa dan koleksi doa digabung,
 * - pengaturan lokasi, metode, dan tampilan baca diganti dengan isi cadangan.
 */

export const BACKUP_APP = 'muslims-daily';
export const BACKUP_VERSION = 1;

export interface BackupSettings {
	place: string;
	label: string;
	lat: number;
	lng: number;
	method: MethodKey;
	madhab: MadhabKey;
	adjust: Adjust;
	imsak: number;
}

export interface BackupReading {
	lat: boolean;
	tr: boolean;
	wbw: boolean;
	size: number;
}

export interface BackupDoa {
	view: 'card' | 'list';
	sort: 'kat' | 'az' | 'short' | 'long';
	favs: number[];
	/** koleksi doa pribadi; cadangan lama belum punya, dianggap kosong */
	koleksi: Koleksi[];
}

/**
 * Pengaturan tambahan (ditambahkan setelah format versi 1 dipakai). Semuanya opsional:
 * cadangan lama tanpa bagian ini tetap bisa dipulihkan, bagian yang tidak ada dibiarkan.
 */
export interface BackupPrefs {
	/** posisi terakhir membaca Al-Qur'an */
	quran?: { s: number; a: number };
	dzikir?: DzikirPrefs;
	adzan?: AdzanPrefs;
	lang?: 'id' | 'en';
	theme?: 'system' | 'light' | 'dark';
}

export interface Backup {
	app: typeof BACKUP_APP;
	version: number;
	exportedAt: string;
	settings: BackupSettings;
	tracker: TrackerData;
	doa: BackupDoa;
	reading: BackupReading;
	prefs?: BackupPrefs;
}

export function makeBackup(
	data: { settings: BackupSettings; tracker: TrackerData; doa: BackupDoa; reading: BackupReading; prefs?: BackupPrefs },
	now: Date
): Backup {
	return {
		app: BACKUP_APP,
		version: BACKUP_VERSION,
		exportedAt: now.toISOString(),
		settings: data.settings,
		tracker: data.tracker,
		// status "sudah dibaca hari ini" sengaja tidak ikut: hanya berlaku untuk hari itu
		doa: { view: data.doa.view, sort: data.doa.sort, favs: data.doa.favs, koleksi: data.doa.koleksi },
		reading: data.reading,
		...(data.prefs ? { prefs: data.prefs } : {})
	};
}

export function backupFileName(now: Date): string {
	const y = now.getFullYear();
	const m = String(now.getMonth() + 1).padStart(2, '0');
	const d = String(now.getDate()).padStart(2, '0');
	return `muslims-daily-cadangan-${y}-${m}-${d}.json`;
}

/** message = pesan Indonesia (bawaan), en = pasangan Inggrisnya untuk ditampilkan saat bahasa Inggris aktif. */
export class BackupError extends Error {
	constructor(
		message: string,
		readonly en: string = message
	) {
		super(message);
	}
}

const KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
const PRAYER_KEYS = new Set<string>(PRAYERS.map((p) => p.key));
const METHOD_KEYS = new Set<string>(METHODS.map((m) => m.key));

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

function cleanTracker(raw: unknown): TrackerData {
	if (!isObj(raw)) throw new BackupError('Isi catatan salat tidak terbaca', "The prayer log in this file can't be read");
	const logs: Record<string, DayLog> = {};
	if (isObj(raw.logs)) {
		for (const [key, log] of Object.entries(raw.logs)) {
			if (!KEY_RE.test(key) || !isObj(log)) continue;
			const clean: DayLog = {};
			for (const [p, v] of Object.entries(log)) if (PRAYER_KEYS.has(p) && v === true) clean[p as PrayerKey] = true;
			if (Object.keys(clean).length) logs[key] = clean;
		}
	}
	const udzurDays = Array.isArray(raw.udzurDays)
		? [...new Set(raw.udzurDays.filter((k): k is string => typeof k === 'string' && KEY_RE.test(k)))].sort()
		: [];
	const udzurSince = typeof raw.udzurSince === 'string' && KEY_RE.test(raw.udzurSince) ? raw.udzurSince : null;
	return { logs, udzurDays, udzurSince };
}

function cleanSettings(raw: unknown): BackupSettings | null {
	if (!isObj(raw)) return null;
	const { place, label, lat, lng, method, madhab } = raw;
	if (typeof place !== 'string' || typeof label !== 'string') return null;
	if (!isNum(lat) || !isNum(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
	if (typeof method !== 'string' || !METHOD_KEYS.has(method)) return null;
	if (madhab !== 'syafii' && madhab !== 'hanafi') return null;
	const adjust: Adjust = {};
	if (isObj(raw.adjust)) {
		for (const [k, v] of Object.entries(raw.adjust)) {
			if (PRAYER_KEYS.has(k) && isNum(v) && v !== 0) {
				adjust[k as PrayerKey] = Math.max(-ADJUST_LIMIT, Math.min(ADJUST_LIMIT, Math.round(v)));
			}
		}
	}
	const imsak = isNum(raw.imsak) && raw.imsak >= 0 && raw.imsak <= 30 ? Math.round(raw.imsak) : IMSAK_MINUTES;
	return { place, label: label.slice(0, 80), lat, lng, method: method as MethodKey, madhab, adjust, imsak };
}

function cleanDoa(raw: unknown): BackupDoa | null {
	if (!isObj(raw)) return null;
	const view = raw.view === 'list' ? 'list' : 'card';
	const sort = raw.sort === 'az' || raw.sort === 'short' || raw.sort === 'long' ? raw.sort : 'kat';
	const favs = Array.isArray(raw.favs) ? [...new Set(raw.favs.filter((n): n is number => Number.isInteger(n)))] : [];
	return { view, sort, favs, koleksi: cleanKoleksi(raw.koleksi) };
}

function cleanReading(raw: unknown): BackupReading | null {
	if (!isObj(raw)) return null;
	const { lat, tr, wbw, size } = raw;
	if (typeof lat !== 'boolean' || typeof tr !== 'boolean' || typeof wbw !== 'boolean' || !isNum(size)) return null;
	return { lat, tr, wbw, size: Math.min(46, Math.max(22, Math.round(size))) };
}

const PRAYER_LIST = PRAYERS.map((p) => p.key);

/** Pengaturan tambahan: tiap bagian divalidasi sendiri; yang rusak dibuang tanpa menggagalkan yang lain. */
function cleanPrefs(raw: unknown): BackupPrefs {
	if (!isObj(raw)) return {};
	const out: BackupPrefs = {};
	const q = raw.quran;
	if (isObj(q) && Number.isInteger(q.s) && Number.isInteger(q.a) && (q.s as number) >= 0 && (q.s as number) <= 114 && (q.a as number) >= 0) {
		out.quran = { s: q.s as number, a: q.a as number };
	}
	const d = raw.dzikir;
	if (
		isObj(d) &&
		(d.salat === 'azhar' || d.salat === 'ringkas') &&
		(d.pagi === 'hisn' || d.pagi === 'wirdul') &&
		(d.tasbih === 33 || d.tasbih === 11) &&
		typeof d.haptic === 'boolean' &&
		typeof d.autoNext === 'boolean'
	) {
		out.dzikir = { salat: d.salat, pagi: d.pagi, tasbih: d.tasbih, haptic: d.haptic, autoNext: d.autoNext };
	}
	const a = raw.adzan;
	if (isObj(a) && typeof a.enabled === 'boolean' && isObj(a.on) && (BEFORE_OPTIONS as readonly unknown[]).includes(a.before)) {
		const on = Object.fromEntries(PRAYER_LIST.map((k) => [k, (a.on as Record<string, unknown>)[k] !== false])) as AdzanPrefs['on'];
		out.adzan = { enabled: a.enabled, on, before: a.before as number };
	}
	if (raw.lang === 'id' || raw.lang === 'en') out.lang = raw.lang;
	if (raw.theme === 'system' || raw.theme === 'light' || raw.theme === 'dark') out.theme = raw.theme;
	return out;
}

/** Bagian yang gagal divalidasi bernilai null dan dilewati saat dipulihkan, bukan membatalkan semuanya. */
export interface ParsedBackup {
	exportedAt: Date | null;
	tracker: TrackerData;
	settings: BackupSettings | null;
	doa: BackupDoa | null;
	reading: BackupReading | null;
	/** pengaturan tambahan; kosong untuk cadangan lama */
	prefs: BackupPrefs;
}

export function parseBackup(text: string): ParsedBackup {
	let raw: unknown;
	try {
		raw = JSON.parse(text);
	} catch {
		throw new BackupError('File ini bukan cadangan Muslims Daily', "This file isn't a Muslims Daily backup");
	}
	if (!isObj(raw) || raw.app !== BACKUP_APP) throw new BackupError('File ini bukan cadangan Muslims Daily', "This file isn't a Muslims Daily backup");
	if (!isNum(raw.version) || raw.version > BACKUP_VERSION) {
		throw new BackupError(
			'Cadangan dibuat versi aplikasi yang lebih baru. Perbarui aplikasi dulu.',
			'This backup was made by a newer version of the app. Update the app first.'
		);
	}
	const at = typeof raw.exportedAt === 'string' ? new Date(raw.exportedAt) : null;
	return {
		exportedAt: at && !Number.isNaN(at.getTime()) ? at : null,
		tracker: cleanTracker(raw.tracker),
		settings: cleanSettings(raw.settings),
		doa: cleanDoa(raw.doa),
		reading: cleanReading(raw.reading),
		prefs: cleanPrefs(raw.prefs)
	};
}

/** Gabungan dua catatan: centang dari mana pun dipertahankan. */
export function mergeTracker(current: TrackerData, incoming: TrackerData): TrackerData {
	const logs: Record<string, DayLog> = { ...current.logs };
	for (const [key, log] of Object.entries(incoming.logs)) logs[key] = { ...logs[key], ...log };
	const udzurDays = [...new Set([...current.udzurDays, ...incoming.udzurDays])].sort();
	// mode udzur yang sedang berjalan di perangkat ini lebih dipercaya daripada isi cadangan lama
	const udzurSince = current.udzurSince ?? incoming.udzurSince;
	return { logs, udzurDays, udzurSince };
}

export function trackerSummary(d: TrackerData): { days: number; prayers: number; first: string | null } {
	const keys = Object.keys(d.logs).sort();
	const prayers = keys.reduce((n, k) => n + Object.keys(d.logs[k]).length, 0);
	return { days: keys.length, prayers, first: keys[0] ?? null };
}
