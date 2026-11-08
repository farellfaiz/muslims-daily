import { CATEGORIES, ITEMS } from '#lib/server/doa.ts';
import type { PageServerLoad } from './$types';

// Koleksi (seperti favorit) tersimpan di perangkat, jadi halaman memuat semua ringkasan lalu menyaring di browser.
export const load: PageServerLoad = () => ({ items: ITEMS, categories: CATEGORIES });
