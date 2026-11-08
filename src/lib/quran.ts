/**
 * Al-Qur'an: tipe data dan fungsi bantu.
 *
 * Data dibuat oleh scripts/quran-data.mjs dari quran.com (teks Utsmani, transliterasi, dan arti per kata)
 * dengan terjemahan Kementerian Agama RI. Daftar surat (static/data/surat.json) kecil dan ikut precache;
 * isi tiap surat (static/data/quran/<n>.json) diunduh saat dibuka lalu disimpan untuk offline.
 */
import type { Word } from './perKata.ts';

export interface Surat {
	n: number;
	/** nama latin, mis. "Al-Baqarah" */
	nama: string;
	arab: string;
	/** arti nama surat */
	arti: string;
	ayat: number;
	tempat: 'Makkiyah' | 'Madaniyah';
}

export interface Ayat {
	/** terjemahan Kemenag */
	t: string;
	/** [teks Utsmani, transliterasi, arti] per kata */
	w: Word[];
}

export interface SuratData {
	n: number;
	ayat: Ayat[];
}

export const SURAT_URL = '/data/surat.json';
export const suratUrl = (n: number) => `/data/quran/${n}.json`;

/** Basmalah, sama persis dengan Al-Fatihah ayat 1 di data (dicek oleh tes). */
export const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';

/** Surat yang tidak diawali basmalah terpisah: Al-Fatihah (basmalah adalah ayat 1) dan At-Taubah. */
export const hasBismillah = (n: number) => n !== 1 && n !== 9;

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
/** angka Arab-Indik untuk penanda akhir ayat, mis. 12 -> ١٢ */
export const arabicNum = (n: number) => String(n).replace(/\d/g, (d) => AR_DIGITS[+d]);

/** huruf kecil tanpa tanda baca dan diakritik: "Al-Baqarah" -> "albaqarah" */
const fold = (s: string) =>
	s
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '');

/**
 * Cari surat lewat nomor, nama latin (ejaan longgar: "baqoroh", "al baqarah"), atau arti nama.
 * Hasil yang namanya diawali kata kunci tampil lebih dulu.
 */
export function searchSurat(list: Surat[], query: string): Surat[] {
	const q = query.trim();
	if (!q) return list;
	if (/^\d+$/.test(q)) return list.filter((s) => String(s.n).startsWith(q));
	// ejaan Indonesia: o/q untuk a/k ("baqoroh"), u untuk w ("taubah"); kata sandang (Al-, An-, Asy-, ...) diabaikan
	const loose = (s: string) =>
		fold(s.replace(/^a[a-z]{1,2}[\s-]+/i, ''))
			.replace(/o/g, 'a')
			.replace(/q/g, 'k')
			.replace(/w/g, 'u')
			.replace(/([aiu])\1+/g, '$1') // "yaasin" -> "yasin"
			.replace(/h$/, '');
	const k = loose(q);
	// "alfatihah" ditulis tanpa spasi: coba juga tanpa "al" di depan
	const keys = k.startsWith('al') && k.length > 4 ? [k, k.slice(2)] : [k];
	const arti = fold(q);
	const exact: Surat[] = [];
	const first: Surat[] = [];
	const rest: Surat[] = [];
	for (const s of list) {
		const name = loose(s.nama);
		if (keys.includes(name)) exact.push(s);
		// "kahfi" juga cocok dengan "Al-Kahf"
		else if (keys.some((x) => name.startsWith(x) || (name.length >= 3 && x.startsWith(name)))) first.push(s);
		else if (keys.some((x) => name.includes(x)) || fold(s.arti).includes(arti)) rest.push(s);
	}
	return exact.concat(first, rest);
}

/** Juz: daftar bagian [surat, ayat awal, ayat akhir]. */
export interface Juz {
	j: number;
	s: [surat: number, dari: number, sampai: number][];
}

export const JUZ_URL = '/data/juz.json';

/** Juz yang dimulai di dalam surat ini: ayat awal -> nomor juz. */
export function juzStarts(juz: Juz[], surat: number): Map<number, number> {
	const out = new Map<number, number>();
	for (const z of juz) if (z.s[0][0] === surat) out.set(z.s[0][1], z.j);
	return out;
}

/** Juz tempat sebuah ayat berada. */
export function juzOf(juz: Juz[], surat: number, ayat: number): number {
	return juz.find((z) => z.s.some(([n, a, b]) => n === surat && ayat >= a && ayat <= b))?.j ?? 0;
}

/**
 * Pencarian langsung ke ayat: "2:255", "2 255", "baqarah 255", "al-baqarah:255".
 * Hanya mengembalikan hasil bila suratnya ketemu dan nomor ayatnya ada.
 */
export function parseJump(list: Surat[], query: string): { surat: Surat; ayat: number } | null {
	const m = query.trim().match(/^(.+?)\s*[:\s.]\s*(\d{1,3})$/);
	if (!m) return null;
	const ayat = Number(m[2]);
	const surat = /^\d+$/.test(m[1]) ? list[Number(m[1]) - 1] : searchSurat(list, m[1])[0];
	return surat && ayat >= 1 && ayat <= surat.ayat ? { surat, ayat } : null;
}
