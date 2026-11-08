import type { PrayerKey } from './sky.ts';

/**
 * Bahasa landing page: Indonesia (bawaan) atau Inggris, dengan pola yang sama seperti aplikasinya:
 * teks ditulis berpasangan di tempatnya, tr('Jadwal salat', 'Prayer times').
 * Halaman diprerender dalam bahasa Indonesia; pilihan Inggris berlaku begitu halaman hidup di browser.
 */
export type Lang = 'id' | 'en';

const KEY = 'mdl:lang';
const current = $state<{ code: Lang }>({ code: 'id' });

export const lang = () => current.code;
export const isEn = () => current.code === 'en';
export const tr = (id: string, en: string) => (current.code === 'en' ? en : id);

function apply(code: Lang) {
	current.code = code;
	document.documentElement.lang = code;
}

/** Terapkan bahasa tersimpan. Dipanggil sekali setelah halaman hidup. */
export function startLang() {
	try {
		if (localStorage.getItem(KEY) === 'en') apply('en');
	} catch {
		/* storage diblokir: tetap bahasa bawaan */
	}
}

export function toggleLang() {
	const code = isEn() ? 'id' : 'en';
	apply(code);
	try {
		localStorage.setItem(KEY, code);
	} catch {
		/* storage diblokir: bahasa tetap berlaku selama halaman terbuka */
	}
}

const PRAYER_EN: Record<PrayerKey, string> = {
	subuh: 'Fajr',
	dzuhur: 'Dhuhr',
	ashar: 'Asr',
	maghrib: 'Maghrib',
	isya: 'Isha'
};
const PRAYER_ID: Record<PrayerKey, string> = {
	subuh: 'Subuh',
	dzuhur: 'Dzuhur',
	ashar: 'Ashar',
	maghrib: 'Maghrib',
	isya: 'Isya'
};
export const prayerName = (key: PrayerKey) => (isEn() ? PRAYER_EN : PRAYER_ID)[key];

const ARC_EN: Record<string, string> = {
	Subuh: 'Fajr',
	Terbit: 'Sunrise',
	Dzuhur: 'Dhuhr',
	Ashar: 'Asr',
	Maghrib: 'Maghrib',
	Isya: 'Isha',
	'Tengah malam': 'Midnight',
	'1/3 akhir': 'Last 1/3'
};
/** Label titik di busur langit pintu hero. */
export const arcLabel = (label: string) => (isEn() ? (ARC_EN[label] ?? label) : label);
