import { METHODS, PRAYERS, type MadhabKey, type MethodKey, type PrayerKey } from './prayer.ts';
import type { DayLog, TrackerData } from './tracker.ts';

/**
 * Cadangan data pengguna ke satu file JSON.
 *
 * Semua data hanya ada di localStorage perangkat, jadi bila browser dibersihkan atau pindah HP,
 * riwayat salat ikut hilang. File cadangan ini disimpan sendiri oleh pengguna (tidak ada server).
 *
 * Saat dipulihkan:
 * - catatan salat dan hari udzur DIGABUNG dengan yang sudah ada (tidak ada centang yang hilang),
 * - favorit doa digabung,
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
}

export interface Backup {
	app: typeof BACKUP_APP;
	version: number;
	exportedAt: string;
	settings: BackupSettings;
	tracker: TrackerData;
	doa: BackupDoa;
	reading: BackupReading;
}

export function makeBackup(
	data: { settings: BackupSettings; tracker: TrackerData; doa: BackupDoa; reading: BackupReading },
	now: Date
): Backup {
	return {
		app: BACKUP_APP,
		version: BACKUP_VERSION,
		exportedAt: now.toISOString(),
		settings: data.settings,
		tracker: data.tracker,
		// status "sudah dibaca hari ini" sengaja tidak ikut: hanya berlaku untuk hari itu
		doa: { view: data.doa.view, sort: data.doa.sort, favs: data.doa.favs },
		reading: data.reading
	};
}

export function backupFileName(now: Date): string {
	const y = now.getFullYear();
	const m = String(now.getMonth() + 1).padStart(2, '0');
	const d = String(now.getDate()).padStart(2, '0');
	return `muslims-daily-cadangan-${y}-${m}-${d}.json`;
}

export class BackupError extends Error {}

const KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
const PRAYER_KEYS = new Set<string>(PRAYERS.map((p) => p.key));
const METHOD_KEYS = new Set<string>(METHODS.map((m) => m.key));

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

function cleanTracker(raw: unknown): TrackerData {
	if (!isObj(raw)) throw new BackupError('Isi catatan salat tidak terbaca');
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
	return { place, label: label.slice(0, 80), lat, lng, method: method as MethodKey, madhab };
}

function cleanDoa(raw: unknown): BackupDoa | null {
	if (!isObj(raw)) return null;
	const view = raw.view === 'list' ? 'list' : 'card';
	const sort = raw.sort === 'az' || raw.sort === 'short' || raw.sort === 'long' ? raw.sort : 'kat';
	const favs = Array.isArray(raw.favs) ? [...new Set(raw.favs.filter((n): n is number => Number.isInteger(n)))] : [];
	return { view, sort, favs };
}

function cleanReading(raw: unknown): BackupReading | null {
	if (!isObj(raw)) return null;
	const { lat, tr, wbw, size } = raw;
	if (typeof lat !== 'boolean' || typeof tr !== 'boolean' || typeof wbw !== 'boolean' || !isNum(size)) return null;
	return { lat, tr, wbw, size: Math.min(46, Math.max(22, Math.round(size))) };
}

/** Bagian yang gagal divalidasi bernilai null dan dilewati saat dipulihkan, bukan membatalkan semuanya. */
export interface ParsedBackup {
	exportedAt: Date | null;
	tracker: TrackerData;
	settings: BackupSettings | null;
	doa: BackupDoa | null;
	reading: BackupReading | null;
}

export function parseBackup(text: string): ParsedBackup {
	let raw: unknown;
	try {
		raw = JSON.parse(text);
	} catch {
		throw new BackupError('File ini bukan cadangan Muslims Daily');
	}
	if (!isObj(raw) || raw.app !== BACKUP_APP) throw new BackupError('File ini bukan cadangan Muslims Daily');
	if (!isNum(raw.version) || raw.version > BACKUP_VERSION) {
		throw new BackupError('Cadangan dibuat versi aplikasi yang lebih baru. Perbarui aplikasi dulu.');
	}
	const at = typeof raw.exportedAt === 'string' ? new Date(raw.exportedAt) : null;
	return {
		exportedAt: at && !Number.isNaN(at.getTime()) ? at : null,
		tracker: cleanTracker(raw.tracker),
		settings: cleanSettings(raw.settings),
		doa: cleanDoa(raw.doa),
		reading: cleanReading(raw.reading)
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
