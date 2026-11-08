/**
 * Versi dan pengaturan dzikir. Modul kecil tanpa data bacaan, supaya aman diimpor halaman
 * (teksnya datang dari /data/dzikir.json).
 */
export type SalatVersi = 'azhar' | 'ringkas';

export const SALAT_VERSI: { value: SalatVersi; label: string; sub: string }[] = [
	{ value: 'ringkas', label: 'Ringkas', sub: '11 bacaan sahih dari hadis (Hisnul Muslim)' },
	{ value: 'azhar', label: 'Al-Azhar (Syifa Budi)', sub: '22 bacaan: 6 dzikir lalu 16 doa' }
];

/** Pengaturan dzikir yang diingat (md:dzikirPrefs). */
export interface DzikirPrefs {
	/** versi dzikir setelah salat */
	salat: SalatVersi;
	/**
	 * Jumlah tasbih, tahmid, dan takbir setelah salat: 33 kali masing-masing (HR. Muslim 597),
	 * atau 11 kali masing-masing sehingga totalnya 33 (penjelasan Suhail dalam HR. Muslim 595).
	 */
	tasbih: 33 | 11;
	/** getar halus tiap ketukan */
	haptic: boolean;
	/** setelah satu bacaan selesai, geser ke bacaan berikutnya */
	autoNext: boolean;
}

export const DEFAULT_DZIKIR_PREFS: DzikirPrefs = { salat: 'ringkas', tasbih: 33, haptic: true, autoNext: true };

/** Bacaan yang jumlahnya mengikuti pengaturan tasbih. */
export const TASBIH_SLUGS = ['tasbih', 'tahmid', 'takbir'];

/** Judul bagian per kelompok bacaan, dan bentuk pendeknya untuk ringkasan alur. */
export const GROUP_LABEL = {
	dzikir: ['Dzikir', 'dzikir'],
	doa: ['Doa', 'doa'],
	quran: ["Bacaan Al-Qur'an", "bacaan Al-Qur'an"]
} as const;
