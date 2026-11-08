import { json } from '@sveltejs/kit';
import { CATEGORIES, ITEMS } from '#lib/server/doa.ts';
import type { DoaIndex } from '#lib/doaIndex.ts';

/**
 * Ringkasan semua doa sebagai satu file statis untuk halaman Semua doa, Favorit, dan Koleksi.
 * Dulu tiap halaman itu menanam ringkasan 260 doa di HTML-nya sendiri (sekitar 200 KB per halaman);
 * sekarang satu file ini diunduh sekali, disimpan service worker, dan dipakai bersama.
 */
export const prerender = true;

export function GET() {
	return json({ items: ITEMS, categories: CATEGORIES } satisfies DoaIndex);
}
