/**
 * Arti per kata untuk dzikir setelah salat dan dzikir pagi petang.
 *
 * Datanya file statis (static/data/per-kata.json), baru diunduh saat "Per kata" dinyalakan,
 * supaya tidak menambah JavaScript awal. Ikut di-precache PWA, jadi tetap jalan offline.
 * Ayat Qur'an memakai arti per kata dari quran.com (src: 'quran');
 * bacaan dari hadis masih draf yang perlu dicek orang yang paham (src: 'draf').
 */

/** [teks Arab, transliterasi, arti], sama dengan bentuk Word di doa.ts */
export type Word = [ar: string, lat: string, arti: string];
export interface PerKataEntry {
	src: 'quran' | 'draf';
	w: Word[];
}
export type PerKata = Record<string, PerKataEntry>;

export const PER_KATA_URL = '/data/per-kata.json';

/** kunci entri: salat:<id>, dzikir:<id>, atau dzikir:<id>:petang untuk lafaz petang yang berbeda */
export const perKataKey = (set: 'salat' | 'dzikir', id: number, petang = false) =>
	`${set}:${id}${petang ? ':petang' : ''}`;

const LETTER = /[ء-يٱ-ۓۺ-ۼ]/;

/** Kata-kata teks Arab. Tanda waqaf dan nomor ayat menempel ke kata sebelumnya. */
export function tokens(arabic: string): string[] {
	const out: string[] = [];
	for (const t of arabic.split(/\s+/).filter(Boolean)) {
		if (!LETTER.test(t) && out.length) out[out.length - 1] += ' ' + t;
		else out.push(t);
	}
	return out;
}

let cache: Promise<PerKata> | null = null;

/** Unduh sekali per sesi; bila gagal, percobaan berikutnya mengunduh ulang. */
export function loadPerKata(): Promise<PerKata> {
	cache ??= fetch(PER_KATA_URL)
		.then((r) => {
			if (!r.ok) throw new Error(`HTTP ${r.status}`);
			return r.json() as Promise<PerKata>;
		})
		.catch((e) => {
			cache = null;
			throw e;
		});
	return cache;
}
