/**
 * Versi dan pengaturan dzikir. Modul kecil tanpa data bacaan, supaya aman diimpor halaman
 * (teksnya datang dari /data/dzikir.json).
 */
export type SalatVersi = 'azhar' | 'ringkas';

/** Pilihan versi. labelEn dan subEn untuk antarmuka bahasa Inggris (dipilih di komponen). */
export interface VersiOpt<V> {
	value: V;
	label: string;
	sub: string;
	labelEn: string;
	subEn: string;
}

export const SALAT_VERSI: VersiOpt<SalatVersi>[] = [
	{
		value: 'ringkas',
		label: 'Ringkas',
		sub: '11 bacaan sahih dari hadis (Hisnul Muslim)',
		labelEn: 'Short',
		subEn: '11 authentic readings from hadith (Hisnul Muslim)'
	},
	{
		value: 'azhar',
		label: 'Al-Azhar (Syifa Budi)',
		sub: '22 bacaan: 6 dzikir lalu 16 doa',
		labelEn: 'Al-Azhar (Syifa Budi)',
		subEn: '22 readings: 6 dhikr, then 16 duas'
	}
];

export type PagiVersi = 'hisn' | 'wirdul';

export const PAGI_VERSI: VersiOpt<PagiVersi>[] = [
	{
		value: 'hisn',
		label: 'Hisnul Muslim',
		sub: 'Bacaan dari hadis dengan rujukannya, sekitar 20 bacaan',
		labelEn: 'Hisnul Muslim',
		subEn: 'Readings from hadith with references, about 20 readings'
	},
	{
		value: 'wirdul',
		label: 'Wirdul Lathif (al-Haddad)',
		sub: '56 bacaan, naskah NU Online',
		labelEn: 'Wirdul Lathif (al-Haddad)',
		subEn: '56 readings, NU Online text'
	}
];

/** Pengaturan dzikir yang diingat (md:dzikirPrefs). */
export interface DzikirPrefs {
	/** versi dzikir setelah salat */
	salat: SalatVersi;
	/** versi dzikir pagi dan petang */
	pagi: PagiVersi;
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

export const DEFAULT_DZIKIR_PREFS: DzikirPrefs = { salat: 'ringkas', pagi: 'hisn', tasbih: 33, haptic: true, autoNext: true };

/** Bacaan yang jumlahnya mengikuti pengaturan tasbih. */
export const TASBIH_SLUGS = ['tasbih', 'tahmid', 'takbir'];

/** Judul bagian per kelompok bacaan, dan bentuk pendeknya untuk ringkasan alur. */
export const GROUP_LABEL = {
	dzikir: ['Dzikir', 'dzikir'],
	doa: ['Doa', 'doa'],
	quran: ["Bacaan Al-Qur'an", "bacaan Al-Qur'an"]
} as const;

/** Pasangan Inggris untuk GROUP_LABEL. */
export const GROUP_LABEL_EN = {
	dzikir: ['Dhikr', 'dhikr'],
	doa: ['Duas', 'duas'],
	quran: ["Qur'an readings", "Qur'an readings"]
} as const;
