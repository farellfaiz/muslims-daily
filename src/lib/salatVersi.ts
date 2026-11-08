/**
 * Versi dzikir dan doa setelah salat yang bisa dipilih pengguna.
 * Modul kecil tanpa data bacaan, supaya aman diimpor halaman (teksnya datang dari /data/dzikir.json).
 */
export type SalatVersi = 'azhar' | 'ringkas';

export const SALAT_VERSI: { value: SalatVersi; label: string; sub: string }[] = [
	{ value: 'azhar', label: 'Al-Azhar (Syifa Budi)', sub: '22 bacaan: 6 dzikir lalu 16 doa' },
	{ value: 'ringkas', label: 'Ringkas', sub: '11 bacaan sahih dari hadis (Hisnul Muslim)' }
];

/** Judul bagian per kelompok bacaan, dan bentuk pendeknya untuk ringkasan alur. */
export const GROUP_LABEL = {
	dzikir: ['Dzikir', 'dzikir'],
	doa: ['Doa', 'doa'],
	quran: ["Bacaan Al-Qur'an", "bacaan Al-Qur'an"]
} as const;
