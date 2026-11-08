import type { PrayerKey } from './prayer.ts';
import { Persisted } from './state/persisted.svelte.ts';

/**
 * Bahasa antarmuka: Indonesia (bawaan) atau Inggris.
 *
 * Teks ditulis berpasangan langsung di tempatnya: tr('Jadwal salat', 'Prayer times').
 * Karena membaca state, teks ikut berganti begitu bahasa diubah, tanpa muat ulang.
 * Yang TIDAK diterjemahkan: isi doa, dzikir, dan terjemahan Al-Qur'an (sumbernya berbahasa Indonesia).
 *
 * Halaman diprerender dalam bahasa Indonesia; pengguna bahasa Inggris melihat teks Inggris
 * begitu aplikasi hidup di browser.
 */
export type Lang = 'id' | 'en';

export const lang = new Persisted<{ code: Lang }>('lang', { code: 'id' });

export const isEn = () => lang.value.code === 'en';

/** Pilih teks sesuai bahasa aktif. */
export const tr = (id: string, en: string) => (lang.value.code === 'en' ? en : id);

/** Locale untuk Intl (tanggal, angka). */
export const locale = () => (lang.value.code === 'en' ? 'en-GB' : 'id-ID');

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

/** Nama salat sesuai bahasa: Subuh / Fajr. */
export const prayerName = (key: PrayerKey) => (lang.value.code === 'en' ? PRAYER_EN : PRAYER_ID)[key];

export const LANGS: { code: Lang; label: string }[] = [
	{ code: 'id', label: 'Indonesia' },
	{ code: 'en', label: 'English' }
];
