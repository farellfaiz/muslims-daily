/**
 * Kumpulan doa: tipe dan fungsi bantu yang dipakai halaman.
 *
 * Teks doa ada di dua file data, keduanya hanya dibaca di sisi server/prerender
 * (lihat #lib/server/doa.ts) agar tidak ikut JavaScript halaman:
 * - doa.json: dari NU Online (https://quran.nu.or.id/doa), diunduh dengan `node scripts/doa-data.mjs`.
 *   Teks Arab, transliterasi, terjemahan, dan keterangan sumber disalin apa adanya.
 * - doa-kemenag.json: dari buku "Kumpulan Doa Sehari-hari" Kemenag RI (2013), disusun dengan
 *   `node scripts/doa-kemenag.mjs`. Doa yang sudah ada di NU Online tidak dimasukkan.
 * Jangan sunting file JSON itu secara manual; perbaiki di sumbernya lalu jalankan ulang skripnya.
 */

export const SOURCES = {
	nu: { name: 'NU Online', url: 'https://quran.nu.or.id/doa' },
	kemenag: {
		name: 'Kemenag RI',
		url: null,
		book: 'Kumpulan Doa Sehari-hari, Kementerian Agama RI (cetakan III, 2013)',
		/** pasangan Inggris untuk antarmuka berbahasa Inggris; judul buku tetap */
		bookEn: 'Kumpulan Doa Sehari-hari, Ministry of Religious Affairs of Indonesia (3rd printing, 2013)'
	}
} as const;
export type SourceKey = keyof typeof SOURCES;

/** Satu bacaan doa, atau subjudul pemisah pada doa yang panjang. */
export type Part = { arabic: string; latin: string; translation: string } | { heading: string };
export type Reading = Extract<Part, { arabic: string }>;

export const isReading = (p: Part): p is Reading => 'arabic' in p;

export interface Category {
	slug: string;
	/** nama lengkap di NU Online, mis. "Doa Keseharian" */
	name: string;
	/** nama tanpa awalan "Doa", mis. "Keseharian" */
	short: string;
	count: number;
}

/** Ringkasan doa untuk daftar (tanpa teks lengkap). */
export interface DoaItem {
	id: number;
	slug: string;
	category: string;
	title: string;
	/** teks Arab bacaan pertama, dipotong */
	preview: string;
	/** jumlah bacaan (tanpa subjudul) */
	readings: number;
	words: number;
	/** teks pencarian yang sudah dinormalisasi */
	search: string;
}

/** Doa lengkap untuk layar baca. */
export interface Doa {
	id: number;
	slug: string;
	category: string;
	title: string;
	parts: Part[];
	/** keterangan sumber */
	note: string;
	/** penyalin, penerjemah, editor (NU Online) */
	team: string[];
	source: SourceKey;
	/** halaman doa ini di NU Online; null untuk doa dari buku */
	url: string | null;
	/** halaman buku (doa Kemenag) */
	page?: number;
	/** transliterasi/terjemahan disusun Muslims Daily (doa dari buku) */
	ownText: boolean;
	words: number;
}

/** Doa pendek untuk kartu "doa hari ini" di beranda. */
export interface DailyDoa {
	id: number;
	href: string;
	category: string;
	title: string;
	arabic: string;
	translation: string;
}

export const doaHref = (d: { category: string; slug: string }) => `/doa/${d.category}/${d.slug}`;

export const shortName = (name: string) => {
	const s = name.replace(/^doa\s+/i, '').trim();
	return s.charAt(0).toUpperCase() + s.slice(1);
};

export const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;

/**
 * Pencarian toleran ejaan: dhuha = duha = dluha, syifa = sifa, shalat = sholat = salat,
 * qubur = kubur, Allah = Alah. Teks dan kata kunci sama-sama dinormalisasi.
 */
export function normalize(s: string): string {
	return s
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/dh|dl|dz/g, 'd')
		.replace(/sy|sh|ts/g, 's')
		.replace(/kh|q/g, 'k')
		.replace(/th/g, 't')
		.replace(/o/g, 'a')
		.replace(/[^a-z0-9 ]/g, '')
		.replace(/([a-z])\1+/g, '$1');
}

/** Doa pilihan berganti setiap hari, sama untuk semua orang di hari yang sama. */
export function doaOfTheDay<T>(pool: T[], date: Date): T | undefined {
	const dayNumber = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 864e5);
	return pool[dayNumber % pool.length];
}
